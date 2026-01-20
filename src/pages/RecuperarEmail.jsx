import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { X } from "lucide-react";
import "../App.css";

function RecuperarEmail() {
  const navigate = useNavigate();

  const [emailActual, setEmailActual] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [repetirEmail, setRepetirEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // =========================
  // VALIDACIONES
  // =========================
  const emailValido = (e) => e && e.includes("@");

  const emailsCoinciden =
    nuevoEmail.length > 0 && nuevoEmail === repetirEmail;

  const canSubmit =
    emailValido(emailActual) &&
    emailValido(nuevoEmail) &&
    emailsCoinciden &&
    !loading;

  // =========================
  // ENVIAR SOLICITUD
  // =========================
  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("email_change_requests")
      .insert({
        email_actual: emailActual.trim(),
        email_nuevo: nuevoEmail.trim(),
        telefono: telefono.trim() || null,
      });

    if (insertError) {
      console.error(insertError);
      setError(
        "No se pudo enviar la solicitud. Intentá nuevamente."
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <>
      <div className="account-overlay-light">
        <div className="account-panel">
          <h1 className="account-title">
            ¿Perdiste acceso a tu correo electrónico?
          </h1>

          <p className="account-subtitle">
            Si ya no tenés acceso al correo con el que te
            registraste, podés solicitar un cambio manual.
            Un administrador revisará tu solicitud y se
            pondrá en contacto con vos.
          </p>

          <div className="config-section">
            <input
              type="email"
              className="config-input"
              placeholder="Correo con el que te registraste"
              value={emailActual}
              onChange={(e) => setEmailActual(e.target.value)}
            />

            <input
              type="email"
              className="config-input"
              placeholder="Nuevo correo electrónico"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
            />

            <input
              type="email"
              className="config-input"
              placeholder="Repetir nuevo correo electrónico"
              value={repetirEmail}
              onChange={(e) => setRepetirEmail(e.target.value)}
            />

            <input
              type="tel"
              className="config-input"
              placeholder="WhatsApp (opcional)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          {!emailsCoinciden &&
            repetirEmail.length > 0 && (
              <div className="error-text">
                Los correos nuevos no coinciden
              </div>
            )}

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
              onClick={handleSubmit}
            >
              {loading
                ? "Enviando solicitud..."
                : "Enviar solicitud de cambio de email"}
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

      {/* ===== MODAL CONFIRMACIÓN ===== */}
      {showSuccess && (
        <div
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
              maxWidth: "420px",
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
              Solicitud enviada
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              Un administrador verificará tus datos y se
              pondrá en contacto con vos para continuar
              con el cambio de correo electrónico.
            </p>

            <button
              className="account-btn"
              style={{ width: "100%" }}
              onClick={() => {
                setShowSuccess(false);
                navigate("/");
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecuperarEmail;
