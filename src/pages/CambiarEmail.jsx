import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { X } from "lucide-react";
import "../App.css";

function CambiarEmail() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  // =========================
  // VALIDACIONES
  // =========================
  const emailValido =
    nuevoEmail.length > 0 && nuevoEmail.includes("@");
  const passwordValida = password.length >= 6;

  const canSubmit = emailValido && passwordValida && !loading;

  // =========================
  // SOLICITAR CAMBIO
  // =========================
  const handleRequestChange = async () => {
    setError("");
    setLoading(true);

    try {
      // 1️⃣ obtener sesión actual
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();

      if (sessionErr || !session?.user?.email) {
        setError("Sesión inválida. Volvé a iniciar sesión.");
        return;
      }

      const emailActual = session.user.email;
      setCurrentEmail(emailActual);

      // 2️⃣ reautenticación (contraseña actual)
      const { error: signInErr } =
        await supabase.auth.signInWithPassword({
          email: emailActual,
          password,
        });

      if (signInErr) {
        setError("La contraseña ingresada es incorrecta.");
        return;
      }

      // 3️⃣ solicitar cambio de email
      const { error: updateErr } =
        await supabase.auth.updateUser({
          email: nuevoEmail,
        });

      if (updateErr) {
        setError(
          updateErr.message ||
            "No se pudo solicitar el cambio de correo."
        );
        return;
      }

      // 4️⃣ éxito
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="account-overlay-light">
        <div className="account-panel">
          <h1 className="account-title">Cambiar correo</h1>

          <p className="account-subtitle">
            Para proteger tu cuenta, confirmá tu identidad
            ingresando tu contraseña. Luego deberás validar
            el cambio desde tu correo actual.
          </p>

          <div className="config-section">
            <input
              type="password"
              className="config-input"
              placeholder="Contraseña actual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="email"
              className="config-input"
              placeholder="Nuevo correo electrónico"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-text">{error}</div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "1rem",
            }}
          >
            <button
              className="account-btn"
              disabled={!canSubmit}
              onClick={handleRequestChange}
            >
              {loading
                ? "Solicitando cambio..."
                : "Solicitar cambio de correo"}
            </button>

            <button
              className="account-btn secondary"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL ÉXITO ===== */}
      {showSuccess && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "620px",
              width: "90%",
              position: "relative",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X />
            </button>

            <h2
              style={{
                marginBottom: "12px",
                fontSize: "22px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              📩 Confirmá el cambio de correo
            </h2>

            <p
              style={{
                fontSize: "20px",
                color: "#374151",
                marginBottom: "18px",
                lineHeight: 1.6,
              }}
            >
              Te enviamos un correo a tu dirección actual:
              <br />
              <strong>{currentEmail}</strong>
              <br />
              <br />
              Abrilo y confirmá el cambio para que se
              actualice tu email.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                className="account-btn secondary"
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/recuperar-email");
                }}
              >
                Perdí acceso a este correo
              </button>

              <button
                className="account-btn"
                onClick={() => setShowSuccess(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CambiarEmail;
