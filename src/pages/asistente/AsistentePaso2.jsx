import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "../../components/ToastGlobal";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

function AsistentePaso2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const isEditMode = new URLSearchParams(location.search).get("mode") === "edit";

  const [categoriaId, setCategoriaId] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState(null);
  const [ramas, setRamas] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
  // LOAD
  // =========================
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;

      setLoaded(false);
      setSubcategorias([]);

      const { data: draft, error } = await supabase
        .from("profile_drafts")
        .select("categoria_id, rama, subcategorias")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !draft?.categoria_id) {
        setLoaded(true);
        return;
      }

      setCategoriaId(draft.categoria_id);
      setSeleccionadas(draft.subcategorias || []);

      const { data: categoria } = await supabase
        .from("categories")
        .select("name")
        .eq("id", draft.categoria_id)
        .maybeSingle();

      setCategoriaNombre(categoria?.name || null);

      const ramasElegidas = normalizeRamas(draft.rama);
      setRamas(ramasElegidas);

      let groupsData = [];
      if (ramasElegidas.length > 0) {
        const { data } = await supabase
          .from("category_groups")
          .select("id, label")
          .in("id", ramasElegidas);

        groupsData = data || [];
      }
      setGroups(groupsData);

      let query = supabase
        .from("subcategories")
        .select("group_id, label, value")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (ramasElegidas.length > 0) {
        query = query.in("group_id", ramasElegidas);
      } else {
        query = query.eq("category_id", draft.categoria_id);
      }

      const { data: subs, error: subsErr } = await query;

      if (subsErr) {
        console.error(subsErr);
        showToast("No se pudieron cargar las subcategorías");
        setLoaded(true);
        return;
      }

      setSubcategorias(subs || []);
      setLoaded(true);
    };

    load();
  }, [user?.id]);

  // =========================
  // GROUP BY
  // =========================
  const grouped = useMemo(() => {
    const acc = {};
    subcategorias.forEach((s) => {
      const key = s.group_id || "default";
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
    });
    return acc;
  }, [subcategorias]);

  if (!loaded) return null;

  // =========================
  // SELECCIÓN (FIX CLAVE)
  // =========================
  const toggleSeleccion = (sub) => {
    if (!categoriaNombre) return;

    const value = `${categoriaNombre}::${sub.value}`;

    setSeleccionadas((prev) =>
      prev.includes(value)
        ? prev.filter((x) => x !== value)
        : [...prev, value]
    );
  };

  const puedeContinuar = () =>
    Object.keys(grouped).every((groupId) =>
      seleccionadas.some((v) =>
        grouped[groupId].some((s) => v.endsWith(`::${s.value}`))
      )
    );

  const continuar = async () => {
    if (!user?.id) return showToast("Sesión inválida");

    if (!puedeContinuar()) {
      showToast("Seleccioná al menos una subcategoría.");
      return;
    }

    const { error } = await supabase
      .from("profile_drafts")
      .upsert(
        {
          user_id: user.id,
          subcategorias: seleccionadas,
          paso_actual: 3,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      showToast("No se pudo guardar el progreso.");
      return;
    }

    navigate(
      isEditMode
        ? "/asistente-profesional/paso-3?mode=edit"
        : "/asistente-profesional/paso-3"
    );
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="asistente-page">
      <button
        className="asistente-back"
        onClick={() =>
          navigate(
            isEditMode
              ? "/asistente-profesional/paso-intermedio?mode=edit"
              : -1
          )
        }
      >
        ← Volver
      </button>

      <h1 className="asistente-title">
        Paso 2 · Elegí tus subcategorías
      </h1>

      <p className="asistente-subtitle">
        Seleccioná al menos una subcategoría.
      </p>

      {Object.entries(grouped).map(([groupId, subs]) => {
        const group = groups.find((g) => g.id === groupId);

        return (
          <div key={groupId} className="asistente-section-block">
            <h3 className="asistente-section-title">
              {group?.label || categoriaNombre || "Categoría"}
            </h3>

            <div className="asistente-grid asistente-grid-centered">
              {subs.map((sub) => {
                const value = `${categoriaNombre}::${sub.value}`;

                return (
                  <div
                    key={sub.value}
                    className={`asistente-card ${
                      seleccionadas.includes(value) ? "selected" : ""
                    }`}
                    onClick={() => toggleSeleccion(sub)}
                  >
                    <div className="asistente-name">{sub.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="asistente-footer">
        <button
          className={`asistente-btn ${puedeContinuar() ? "enabled" : ""}`}
          onClick={continuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default AsistentePaso2;
