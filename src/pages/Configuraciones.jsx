import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useToast } from "../components/ToastGlobal";
import "../App.css";

function Configuraciones() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  /* ================= CERRAR SESIÓN ================= */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      showToast("No se pudo cerrar sesión", "error");
    }
  };

  return (
    <div className="account-overlay-light">
      <div className="account-panel">
        <h1 className="account-title">Configuraciones</h1>

        <p className="account-subtitle">
          Administrá la seguridad de tu cuenta.
        </p>

        <div
          className="account-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            className="account-btn"
            onClick={() => navigate("/configuracion/email")}
          >
            Cambiar correo
          </button>

          <button
            className="account-btn"
            onClick={() => navigate("/configuracion/password")}
          >
            Cambiar contraseña
          </button>

          <button
            className="account-btn"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>

          <button
            className="account-btn"
            onClick={() =>
              showToast(
                "Eliminar cuenta se gestiona desde Mi Cuenta",
                "info"
              )
            }
          >
            Eliminar cuenta
          </button>
        </div>

        <button
          className="account-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}

export default Configuraciones;
