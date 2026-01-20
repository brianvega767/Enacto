import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const esProfesional = profile?.is_professional;
  const esPremium = profile?.is_premium;

  return (
    <div className="dashboard-overlay-light">

      <div className="dashboard-panel">

        {/* TÍTULO */}
        <h1 className="dashboard-title">
          Panel de control
        </h1>

        <p className="dashboard-subtitle">
          Gestioná tu cuenta y accedé a todas las herramientas desde acá.
        </p>

        {/* ============================= */}
        {/* USUARIO COMÚN */}
        {/* ============================= */}
        {!esProfesional && (
          <div className="dashboard-highlight">
            <h3>🚀 Empezá a mostrar tu perfil</h3>
            <p>
              Creá tu cuenta profesional gratis y empezá a recibir consultas reales.
            </p>

            <button
              className="dashboard-primary-btn"
              onClick={() => navigate("/asistente-profesional/paso-1")}
            >
              Crear cuenta profesional
            </button>
          </div>
        )}

        {/* ============================= */}
        {/* PROFESIONAL NO PREMIUM */}
        {/* ============================= */}
        {esProfesional && !esPremium && (
          <div className="dashboard-highlight premium">
            <h3>⭐ Potenciá tu perfil</h3>
            <p>
              Pasate a premium y desbloqueá herramientas avanzadas para crecer más rápido.
            </p>

            <button
              className="dashboard-primary-btn premium"
              onClick={() => navigate("/premium")}
            >
              Hacete Premium
            </button>
          </div>
        )}

        {/* ============================= */}
        {/* ACCIONES */}
        {/* ============================= */}
        <div className="dashboard-actions">

          {esProfesional && (
            <button
              className="dashboard-btn"
              onClick={() => navigate("/perfil/" + profile.slug)}
            >
              Ver mi perfil público
            </button>
          )}

          <button
            className="dashboard-btn"
            onClick={() => navigate("/mi-cuenta")}
          >
            Mi cuenta
          </button>

          <button
            className="dashboard-btn danger"
            onClick={logout}
          >
            Cerrar sesión
          </button>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
