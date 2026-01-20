import { useNavigate } from "react-router-dom";
import "../App.css";

function ComingSoonProfessional() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-card">
        <h1>🚧 Cuenta profesional</h1>

        <p>
          Estamos terminando de preparar la experiencia profesional.
          Muy pronto vas a poder crear tu perfil y mostrar tu trabajo.
        </p>

        <button
          className="dashboard-main-btn"
          onClick={() => navigate("/mi-cuenta")}
        >
          Volver a mi cuenta
        </button>
      </div>
    </div>
  );
}

export default ComingSoonProfessional;
