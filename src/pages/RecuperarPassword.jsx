import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

function RecuperarPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              window.location.origin +
              "/reset-password",
          }
        );

      // Supabase no revela si el email existe (correcto)
      if (error) {
        console.error(error);
      }

      // Mostrar modal de éxito SIEMPRE
      setShowModal(true);
    } catch (err) {
      console.error(
        "Error al iniciar recuperación:",
        err
      );
      setErrorMsg(
        "No se pudo iniciar la recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MODAL DE CONFIRMACIÓN */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button
              style={closeButtonStyle}
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <h2 style={modalTitleStyle}>
              Revisá tu correo
            </h2>

            <p style={modalTextStyle}>
              Si existe una cuenta con ese email, te
              enviamos un enlace para restablecer tu
              contraseña.
            </p>
          </div>
        </div>
      )}

      <div className="auth-screen">
        <div className="auth-card">
          <h1>Recuperar contraseña</h1>

          <p
            style={{
              marginBottom: "1.5rem",
              color: "#555",
              fontSize: "1.2rem",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            Ingresá tu email y te enviaremos un enlace
            para crear una nueva contraseña.
          </p>

          {errorMsg && (
            <div
              className="error-text"
              style={{ marginBottom: "1rem" }}
            >
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={handleRecover}
            className="auth-form"
          >
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Enviando..."
                : "Enviar enlace"}
            </button>
          </form>

          <button
            className="auth-link"
            style={{
              marginTop: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );
}

/* =======================
   🎨 ESTILOS DEL MODAL
   ======================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  borderRadius: "14px",
  padding: "2rem",
  width: "90%",
  maxWidth: "420px",
  position: "relative",
  textAlign: "center",
  boxShadow:
    "0 20px 40px rgba(0, 0, 0, 0.2)",
};

const closeButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
  color: "#666",
};

const modalTitleStyle = {
  marginBottom: "1rem",
  fontSize: "1.4rem",
  color: "#111",
};

const modalTextStyle = {
  fontSize: "1.05rem",
  color: "#444",
  lineHeight: "1.5",
};

export default RecuperarPassword;
