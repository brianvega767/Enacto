import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emailInvalid = email && !email.includes("@");
  const shortPassword = password.length > 0 && password.length < 8;
  const passwordsMismatch = repeat && password !== repeat;

  const EyeOpen = (
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
  );

  const EyeClosed = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#777"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.61 1.71-3.04 2.85-4.24M22.94 12c-1.23 2.63-3.5 5.35-6.94 6.94M9.88 9.88A3 1 0 1 0 14.12 14.12" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // ✅ Registro OK → verificación de email
      navigate("/verificar-email", {
        replace: true,
        state: { email },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Crear cuenta</h1>

        {errorMsg && (
          <div className="error-text" style={{ marginBottom: "1rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Nombre"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {emailInvalid && (
            <div className="error-text">Email inválido</div>
          )}

          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña (mín 8 caracteres)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? EyeClosed : EyeOpen}
            </span>
          </div>

          {shortPassword && (
            <div className="error-text">
              Mínimo 8 caracteres obligatorios
            </div>
          )}

          <div className="password-wrapper">
            <input
              type={passwordVisible2 ? "text" : "password"}
              placeholder="Repetir contraseña"
              required
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() =>
                setPasswordVisible2(!passwordVisible2)
              }
            >
              {passwordVisible2 ? EyeClosed : EyeOpen}
            </span>
          </div>

          {passwordsMismatch && (
            <div className="error-text">
              Las contraseñas no coinciden
            </div>
          )}

          <button
            type="submit"
            disabled={
              emailInvalid ||
              shortPassword ||
              passwordsMismatch ||
              loading
            }
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
