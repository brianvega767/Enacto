import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

function CambiarPassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completá todos los campos.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        throw new Error("No se pudo verificar el usuario.");
      }

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (signInError) {
        throw new Error("La contraseña actual es incorrecta.");
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) throw updateError;

      setSuccess("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-overlay-light">
      <div
        className="account-panel"
        style={{
          maxWidth: "560px",
          padding: "2.5rem",
        }}
      >
        <h1
          className="account-title"
          style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}
        >
          Cambiar contraseña
        </h1>

        <p
          className="account-subtitle"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            marginBottom: "2rem",
          }}
        >
          Por seguridad, confirmá tu contraseña actual y
          luego ingresá una nueva contraseña para tu cuenta.
        </p>

        {/* INPUTS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <div>
            <label style={labelStyle}>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña nueva</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Repetir contraseña nueva
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={errorStyle}>{error}</div>
          )}

          {success && (
            <div style={successStyle}>{success}</div>
          )}

          {/* ACCIONES */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={() =>
                navigate("/recuperar-password")
              }
              disabled={loading}
              style={linkButtonStyle}
            >
              Olvidé mi contraseña
            </button>

            <button
              className="account-btn"
              onClick={handleChangePassword}
              disabled={loading}
              style={{
                padding: "0.9rem 1.8rem",
                fontSize: "1rem",
              }}
            >
              {loading
                ? "Guardando..."
                : "Guardar cambio"}
            </button>
          </div>

          <button
            className="account-btn secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */
const inputStyle = {
  width: "100%",
  padding: "0.9rem 0.75rem",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "#444",
};

const errorStyle = {
  background: "#ffecec",
  color: "#b00020",
  padding: "0.75rem",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

const successStyle = {
  background: "#e8f7ef",
  color: "#1b7f5a",
  padding: "0.75rem",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

const linkButtonStyle = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "0.9rem",
  color: "#555",
  cursor: "pointer",
  textDecoration: "underline",
};

export default CambiarPassword;
