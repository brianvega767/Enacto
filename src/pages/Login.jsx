import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const { syncSession } = useAuth(); // ✅ función del contexto

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      // 1️⃣ Login en Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("Email o contraseña incorrectos");
        return;
      }

      // 2️⃣ Sincronizar AuthContext (CLAVE)
      await syncSession();

      // 3️⃣ Ir al HOME
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error inesperado en login:", err);
      setErrorMsg("Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>

        {errorMsg && (
          <div
            className="error-text"
            style={{ marginBottom: "1rem" }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="password-toggle"
              onClick={() =>
                setPasswordVisible(!passwordVisible)
              }
              title={
                passwordVisible
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {passwordVisible ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#777"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.61 1.71-3.04 2.85-4.24M22.94 12c-1.23 2.63-3.5 5.35-6.94 6.94M9.88 9.88A3 3 0 1 0 14.12 14.12" />
                  <line
                    x1="1"
                    y1="1"
                    x2="23"
                    y2="23"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#777"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        {/* 🔑 Recuperar contraseña */}
        <Link
          to="/recuperar-password"
          className="auth-link"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <p className="auth-footer">
          ¿No tenés cuenta?{" "}
          <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
