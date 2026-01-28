import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function FeriasAccessModal({ onClose, targetTool }) {
  const navigate = useNavigate();
  const { user, profile, profileLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  // null | "pending" | "approved"

  // 🔑 CLAVE ÚNICA PARA TODAS LAS HERRAMIENTAS DE FERIANTES
  const TOOL_KEY = "feriantes";

  /* =====================
     CHEQUEO DE ACCESO
     ===================== */
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || profileLoading) {
        setLoading(false);
        return;
      }

      if (!profile?.is_professional) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tool_access_requests")
        .select("status")
        .eq("user_id", user.id)
        .eq("tool_key", TOOL_KEY)
        .maybeSingle();

      if (!error) {
        setRequestStatus(data?.status ?? null);
      }

      setLoading(false);
    };

    checkAccess();
  }, [user, profile, profileLoading]);

  /* =====================
     REDIRECCIÓN AUTOMÁTICA
     ===================== */
  useEffect(() => {
    if (requestStatus === "approved") {
      onClose();

      if (targetTool === "colaboradores") {
        navigate("/herramientas/colaboradores");
      } else {
        navigate("/herramientas/ferias");
      }
    }
  }, [requestStatus, targetTool, navigate, onClose]);

  /* =====================
     ACCIONES
     ===================== */
  const solicitarAcceso = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("tool_access_requests")
      .insert({
        user_id: user.id,
        tool_key: TOOL_KEY,
        status: "pending",
      });

    if (error) {
      console.error(error);
      alert("No se pudo enviar la solicitud.");
      return;
    }

    setRequestStatus("pending");
  };

  /* =====================
     RENDER
     ===================== */
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          ✕
        </button>

        {loading && <p style={textStyle}>Cargando…</p>}

        {!loading && !user && (
          <Content
            title="Acceso para profesionales"
            text="Para solicitar el acceso a estas herramientas necesitás estar registrado y tener una cuenta profesional."
            buttonText="Crear cuenta"
            onClick={() => navigate("/register")}
          />
        )}

        {!loading && user && !profile?.is_professional && (
          <Content
            title="Cuenta profesional requerida"
            text="Estas herramientas están pensadas para profesionales. Podés crear tu cuenta profesional gratis."
            buttonText="Crear cuenta profesional"
            onClick={() =>
              navigate("/asistente-profesional/paso-1")
            }
          />
        )}

        {!loading &&
          profile?.is_professional &&
          requestStatus === null && (
            <Content
              title="Acceso a herramientas para feriantes"
              text="Estas herramientas son para emprendedores que participan o planean participar en ferias. El acceso se otorga manualmente para evitar usos incorrectos."
              buttonText="Solicitar acceso"
              onClick={solicitarAcceso}
            />
          )}

        {requestStatus === "pending" && (
          <Content
            title="Solicitud enviada"
            text="Ya recibimos tu solicitud. Un administrador la revisará y se pondrá en contacto con vos."
            buttonText="Cerrar"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
}

export default FeriasAccessModal;

/* =====================================================
   COMPONENTE DE CONTENIDO
   ===================================================== */

function Content({ title, text, buttonText, onClick }) {
  return (
    <>
      <h2 style={titleStyle}>{title}</h2>
      <p style={textStyle}>{text}</p>

      {buttonText && (
        <button style={actionButtonStyle} onClick={onClick}>
          {buttonText}
        </button>
      )}
    </>
  );
}

/* =====================================================
   ESTILOS (SIN CAMBIOS)
   ===================================================== */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalStyle = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "2.5rem",
  width: "100%",
  maxWidth: "520px",
  position: "relative",
  textAlign: "center",
  boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
};

const closeButtonStyle = {
  position: "absolute",
  top: "14px",
  right: "16px",
  background: "none",
  border: "none",
  fontSize: "1.3rem",
  cursor: "pointer",
  color: "#555",
};

const titleStyle = {
  fontSize: "1.6rem",
  fontWeight: "600",
  marginBottom: "1rem",
  color: "#222",
};

const textStyle = {
  fontSize: "1.05rem",
  lineHeight: "1.6",
  color: "#444",
  marginBottom: "1.8rem",
};

const actionButtonStyle = {
  padding: "0.9rem 1.8rem",
  borderRadius: "999px",
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: "0.95rem",
  cursor: "pointer",
};
