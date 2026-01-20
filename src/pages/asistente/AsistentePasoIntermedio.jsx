import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastGlobal";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

function AsistentePasoIntermedio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const isEditMode = new URLSearchParams(location.search).get("mode") === "edit";

  // =========================
  // NORMALIZADOR DEFINITIVO
  // =========================
  const normalizeRamas = (input) => {
    let value = input;
    let safety = 0;

    while (typeof value === "string" && safety < 5) {
      try {
        value = JSON.parse(value);
      } catch {
        break;
      }
      safety++;
    }

    if (!Array.isArray(value)) {
      value = value != null ? [value] : [];
    }

    return value
      .flat(Infinity)
      .filter(
        (v) =>
          typeof v === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            v
          )
      );
  };

  // =========================
  // CARGAR DATOS INICIALES
  // =========================
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.id) return;

      const { data: draft, error } = await supabase
        .from("profile_drafts")
        .select("categoria_id, rama")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !draft?.categoria_id) return;

      // 🔥 restaurar selección previa (normalizada)
      const ramasNormalizadas = normalizeRamas(draft.rama);
      setOpcionesSeleccionadas(ramasNormalizadas);

      // 2️⃣ Traer ramas reales desde category_groups
      const { data: groups, error: groupsErr } = await supabase
        .from("category_groups")
        .select("id, label, emoji")
        .eq("category_id", draft.categoria_id)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (groupsErr || !groups) return;

      const opcionesFinales = groups.map((g) => ({
        key: g.id,
        label: g.label,
        emoji: g.emoji || "🎯",
      }));

      setOpciones(opcionesFinales);
      setDraftLoaded(true);
    };

    cargarDatos();
  }, [user?.id]);

  // =========================
  // TOGGLE OPCIÓN (MULTI REAL)
  // =========================
  const toggleOpcion = (key) => {
    setOpcionesSeleccionadas((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  // =========================
  // CONTINUAR (GUARDA ESTADO REAL)
  // =========================
  const continuar = async () => {
    if (!user?.id) {
      showToast("Sesión inválida");
      return;
    }

    if (opcionesSeleccionadas.length === 0) {
      showToast("Seleccioná al menos una opción para continuar");
      return;
    }

    // 🔥 BLINDADO: SIEMPRE array limpio
    const ramasFinales = normalizeRamas(opcionesSeleccionadas);

    const { error } = await supabase
      .from("profile_drafts")
      .upsert(
        {
          user_id: user.id,
          rama: ramasFinales,
          paso_actual: 2,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error(error);
      showToast("No se pudo guardar el progreso.");
      return;
    }

    navigate(
      isEditMode
        ? "/asistente-profesional/paso-2?mode=edit"
        : "/asistente-profesional/paso-2"
    );
  };

  if (!draftLoaded) return null;

  // =========================
  // RENDER (DISEÑO INTACTO)
  // =========================
  return (
    <div className="asistente-page">
      <button
        className="asistente-back"
        onClick={() =>
          navigate(isEditMode ? "/asistente-profesional/paso-1?mode=edit" : -1)
        }
      >
        ← Volver
      </button>

      <h1 className="asistente-title">
        {isEditMode ? "Editar enfoque" : "¿Qué ofrecés?"}
      </h1>

      <p className="asistente-subtitle">
        Elegí cómo querés que te encuentren dentro de la categoría.
      </p>

      <div className="asistente-grid asistente-grid-centered">
        {opciones.map((opcion) => (
          <div
            key={opcion.key}
            className={`asistente-card ${
              opcionesSeleccionadas.includes(opcion.key) ? "selected" : ""
            }`}
            onClick={() => toggleOpcion(opcion.key)}
          >
            <div className="asistente-icon">{opcion.emoji}</div>
            <div className="asistente-name">{opcion.label}</div>
          </div>
        ))}
      </div>

      <div className="asistente-footer">
        <button
          className={`asistente-btn ${
            opcionesSeleccionadas.length > 0 ? "enabled" : ""
          }`}
          onClick={continuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default AsistentePasoIntermedio;
