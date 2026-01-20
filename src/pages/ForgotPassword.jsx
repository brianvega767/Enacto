import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email | 2 = código
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);

  const handleSendEmail = (e) => {
    e.preventDefault();
    setStep(2);
    setTimer(60);
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
    }
  };

  useEffect(() => {
    if (step !== 2) return;

    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {step === 1 && (
          <>
            <h1>Recuperar contraseña</h1>

            <form onSubmit={handleSendEmail} className="auth-form">
              <input
                type="email"
                placeholder="Ingresá tu email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="submit">Enviar enlace</button>
            </form>

            <p className="auth-footer">
              <Link to="/login">Volver al login</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Ingresar código</h1>

            <p
              style={{
                marginBottom: "1rem",
                fontSize: "0.95rem",
                color: "#333",
              }}
            >
              Enviamos un código al email:
              <br />
              <strong>{email}</strong>
            </p>

            <form className="auth-form">
              <input
                type="text"
                placeholder="Ingresá el código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <button type="submit">Verificar código</button>
            </form>

            {/* FOOTER CON VOLVER + REENVIAR SIEMPRE VISIBLE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {/* VOLVER ATRÁS */}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#000",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Volver atrás
              </button>

              {/* REENVIAR SIEMPRE VISIBLE */}
              <button
                type="button"
                onClick={handleResend}
                disabled={timer !== 0}
                style={{
                  background: "none",
                  border: "none",
                  cursor: timer === 0 ? "pointer" : "not-allowed",
                  color: timer === 0 ? "#000" : "#999",
                  fontWeight: "600",
                  padding: 0,
                }}
              >
                {timer === 0
                  ? "Reenviar código"
                  : `Reenviar código en ${timer}s`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
