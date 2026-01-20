import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../components/ToastGlobal";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

function AsistentePaso1() {
  const [perfilTipo, setPerfilTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);

  // 🔔 Solicitud de categoría
  const [requestEnabled, setRequestEnabled] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requestCount, setRequestCount] = useState(0);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // ✅ Modal éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const isEditMode = new URLSearchParams(location.search).get("mode") === "edit";

  // =========================
  // CARGAR CATEGORÍAS
  // =========================
  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, emoji, has_intermediate")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (!error && data) {
        setCategorias(data);
      }
    };

    cargarCategorias();
  }, []);

  // =========================
  // CARGAR DRAFT
  // =========================
  useEffect(() => {
    const cargarDraft = async () => {
      if (!user?.id || categorias.length === 0) return;

      const { data } = await supabase
        .from("profile_drafts")
        .select("perfil_tipo, categoria_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) return;

      if (data.perfil_tipo) setPerfilTipo(data.perfil_tipo);

      if (data.categoria_id) {
        const found = categorias.find((c) => c.id === data.categoria_id);
        if (found) setCategoriaSeleccionada(found);
      }
    };

    cargarDraft();
  }, [user?.id, categorias]);

  // =========================
  // CARGAR ESTADO DE SOLICITUD
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const loadRequestInfo = async () => {
      const [{ data: setting }, { count }] = await Promise.all([
        supabase
          .from("app_settings")
          .select("value")
          .eq("key", "category_request_enabled")
          .maybeSingle(),
        supabase
          .from("category_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setRequestEnabled(setting?.value !== false);
      setRequestCount(count || 0);
    };

    loadRequestInfo();
  }, [user?.id]);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  // =========================
  // ENVIAR SOLICITUD
  // =========================
  const enviarSolicitud = async () => {
    if (!user?.id) return;

    if (!requestText.trim()) {
      showToast("Ingresá el nombre de la categoría");
      return;
    }

    if (requestText.length > 30) {
      showToast("Máximo 30 caracteres");
      return;
    }

    if (requestCount >= 3) {
      showToast("Alcanzaste el máximo de solicitudes permitidas");
      return;
    }

    setSendingRequest(true);

   const { data: authData } = await supabase.auth.getUser();

   const { error } = await supabase.from("category_requests").insert({
     user_id: user.id,
     requested_name: requestText.trim(),
     email: authData?.user?.email ?? null,
   });


    setSendingRequest(false);

    if (error) {
      console.error(error);
      showToast("No se pudo enviar la solicitud");
      return;
    }

    setShowSuccessModal(true);
  };

  // =========================
  // CONTINUAR
  // =========================
  const continuar = async () => {
    if (!user?.id) {
      showToast("Sesión inválida");
      return;
    }

    if (!isEditMode && !perfilTipo) {
      showToast("Seleccioná qué tipo de perfil querés crear");
      return;
    }

    if (!categoriaSeleccionada) {
      showToast("Seleccioná una categoría antes de continuar");
      return;
    }

    const tienePasoIntermedio = !!categoriaSeleccionada.has_intermediate;

    const payloadDraft = {
      user_id: user.id,
      perfil_tipo: isEditMode ? undefined : perfilTipo,
      categoria: categoriaSeleccionada.name,
      categoria_id: categoriaSeleccionada.id,
      rama: null,
      subcategorias: null,
      paso_actual: 1,
    };

    const cleaned = Object.fromEntries(
      Object.entries(payloadDraft).filter(([, v]) => v !== undefined)
    );

    const { error } = await supabase
      .from("profile_drafts")
      .upsert(cleaned, { onConflict: "user_id" });

    if (error) {
      console.error(error);
      showToast("No se pudo guardar el progreso.");
      return;
    }

    navigate(
      tienePasoIntermedio
        ? isEditMode
          ? "/asistente-profesional/paso-intermedio?mode=edit"
          : "/asistente-profesional/paso-intermedio"
        : isEditMode
        ? "/asistente-profesional/paso-2?mode=edit"
        : "/asistente-profesional/paso-2"
    );
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="asistente-page">
      <button
        className="asistente-back"
        onClick={() => navigate(isEditMode ? "/editar-perfil" : "/mi-cuenta")}
      >
        ← Volver
      </button>

      <h1 className="asistente-title">
        {isEditMode ? "Editar categoría" : "Paso 1 · Contanos qué ofrecés"}
      </h1>

      {!isEditMode && (
        <p className="asistente-subtitle">
          Esto nos permite personalizar tu perfil profesional.
        </p>
      )}

      {!isEditMode && (
        <div className="asistente-grid asistente-grid-centered">
          {[
            { key: "servicios", label: "Servicios", icon: "🧰" },
            { key: "productos", label: "Productos", icon: "📦" },
            { key: "ambos", label: "Ambos", icon: "🔁" },
          ].map((item) => (
            <div
              key={item.key}
              className={`asistente-card ${
                perfilTipo === item.key ? "selected" : ""
              }`}
              onClick={() => setPerfilTipo(item.key)}
            >
              <div className="asistente-icon">{item.icon}</div>
              <div className="asistente-name">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {(perfilTipo || isEditMode) && (
        <>
          <p className="asistente-subtitle" style={{ marginTop: "2rem" }}>
            Elegí la categoría que mejor represente lo que hacés.
          </p>

          <input
            type="text"
            className="asistente-search"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="asistente-grid">
            {categoriasFiltradas.map((cat) => (
              <div
                key={cat.id}
                className={`asistente-card ${
                  categoriaSeleccionada?.id === cat.id ? "selected" : ""
                }`}
                onClick={() =>
                  setCategoriaSeleccionada((prev) =>
                    prev?.id === cat.id ? null : cat
                  )
                }
              >
                <div className="asistente-icon">{cat.emoji}</div>
                <div className="asistente-name">{cat.name}</div>
              </div>
            ))}

            {requestEnabled && (
              <div
                className="asistente-card"
                onClick={() => setShowRequestForm(true)}
              >
                <div className="asistente-icon">➕</div>
                <div className="asistente-name">Otro</div>
              </div>
            )}
          </div>

          {requestEnabled && showRequestForm && (
            <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
              <p className="asistente-subtitle">
                ¿No encontrás la categoría que buscás?
              </p>

             <p className="asistente-request-text" style={{ fontSize: "0.9rem" }}>
             Solicitá una categoría y te avisaremos cuando esté disponible.
            </p>


              <input
                type="text"
                value={requestText}
                maxLength={30}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Nombre de la categoría"
                className="asistente-search"
                style={{ maxWidth: "360px", margin: "1rem auto" }}
              />

              <button
                className="asistente-btn enabled"
                disabled={sendingRequest}
                onClick={enviarSolicitud}
              >
                {sendingRequest ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          )}
        </>
      )}

      <div className="asistente-footer">
        <button
          className={`asistente-btn ${
            categoriaSeleccionada ? "enabled" : ""
          }`}
          onClick={continuar}
        >
          Continuar
        </button>
      </div>

      {/* =========================
          MODAL ÉXITO
         ========================= */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            }}
          >
            <h2 className="asistente-modal" style={{ marginBottom: "12px" }}>
              ¡Solicitud enviada! 🎉
            </h2>

            <p className="asistente-modal" style={{ fontSize: "0.95rem" }}>
              Gracias por tu sugerencia.  
              Te avisaremos cuando la categoría esté disponible.
            </p>

            <button
              className="asistente-btn enabled"
              style={{ marginTop: "24px" }}
              onClick={() => navigate("/")}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsistentePaso1;
