import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🔐 Verificamos que el usuario venga desde el email
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg("Completá todos los campos.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) throw error;

      setSuccessMsg(
        "Contraseña actualizada correctamente. Redirigiendo..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(
        "Error al actualizar contraseña:",
        err
      );
      setErrorMsg(
        "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Nueva contraseña</h1>

        <p
          style={{
            marginBottom: "1.5rem",
            color: "#555",
            fontSize: "0.95rem",
            textAlign: "center",
          }}
        >
          Ingresá una nueva contraseña para tu cuenta.
        </p>

        {errorMsg && (
          <div
            className="error-text"
            style={{ marginBottom: "1rem" }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            className="success-text"
            style={{ marginBottom: "1rem" }}
          >
            {successMsg}
          </div>
        )}

        <form
          onSubmit={handleResetPassword}
          className="auth-form"
        >
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Repetir contraseña"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Guardando..."
              : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
