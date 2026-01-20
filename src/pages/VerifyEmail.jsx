import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";
import "./VerifyEmail.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // El email lo recibimos desde Register vía state
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // =========================
  // CONTADOR
  // =========================
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // =========================
  // VERIFICAR CÓDIGO
  // =========================
  const handleVerify = async () => {
    if (!code || code.length < 4) {
      setError("Ingresá el código que recibiste por email.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    setLoading(false);

    if (error) {
      setError("El código es incorrecto o expiró.");
      return;
    }

    // ✔️ Email verificado → sesión activa
    navigate("/", { replace: true });
  };

  // =========================
  // REENVIAR CÓDIGO
  // =========================
  const handleResend = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo reenviar el código. Intentá más tarde.");
      return;
    }

    setSecondsLeft(60);
    setInfo("Te enviamos un nuevo código a tu email.");
  };

  // =========================
  // GUARDAS
  // =========================
  if (!email) {
    return (
      <div style={{ padding: 40 }}>
        <p>Falta el email para verificar.</p>
        <button onClick={() => navigate("/register")}>
          Volver al registro
        </button>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1 className="verify-title">Verificá tu email</h1>

        <p className="verify-subtitle">
          Enviamos un código de verificación a:
        </p>

        <p className="verify-email">{email}</p>

        <p className="verify-instructions">
          Revisá tu casilla de correo e ingresá el código para activar tu cuenta.
        </p>

        <input
          type="text"
          placeholder="Código de verificación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="verify-input"
        />

        {error && <p className="verify-error">{error}</p>}
        {info && <p className="verify-info">{info}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="verify-button"
        >
          {loading ? "Verificando..." : "Verificar cuenta"}
        </button>

        <div className="verify-footer">
          <button
            type="button"
            className="verify-back"
            onClick={() => navigate(-1)}
          >
            ← Volver atrás
          </button>

          {secondsLeft > 0 ? (
            <span className="verify-timer">
              Reenviar código en {secondsLeft}s
            </span>
          ) : (
            <button
              type="button"
              className="verify-resend"
              onClick={handleResend}
            >
              Reenviar código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
