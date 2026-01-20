import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function ProfessionalPanel() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  const goToPublicProfile = () => {
    if (!profile.slug) return;
    navigate(`/perfil/${profile.slug}`);
  };

  const editProfessionalData = () => {
    navigate("/editar-perfil");
  };

  const editPortfolio = () => {
    navigate("/asistente-profesional/paso-4");
  };

  const upgradeToPremium = () => {
    alert("En el futuro: pantalla para comprar premium 🔥");
  };

  const deleteProfessionalAccount = () => {
    if (!confirm("¿Seguro que querés eliminar tu cuenta profesional?")) return;

    alert(
      "Funcionalidad pendiente: la eliminación real de la cuenta profesional se implementará más adelante."
    );
  };

  return (
    <div className="professional-panel">

      <h1 className="asistente-title">Panel Profesional</h1>

      {/* ESTADO DEL PERFIL */}
      <div className="panel-card">
        <h2>Estado de tu cuenta profesional</h2>
        <p>Tu perfil está activo y visible para otros usuarios.</p>

        <button className="config-btn" onClick={goToPublicProfile}>
          Ver mi perfil público
        </button>
      </div>

      {/* EDITAR DATOS PROFESIONALES */}
      <div className="panel-card">
        <h3>Información profesional</h3>
        <button className="config-btn" onClick={editProfessionalData}>
          Editar mis datos profesionales
        </button>
      </div>

      {/* EDITAR PORTFOLIO */}
      <div className="panel-card">
        <h3>Portfolio</h3>
        <button className="config-btn" onClick={editPortfolio}>
          Editar mi portfolio
        </button>
      </div>

      {/* PREMIUM */}
      {!profile.is_premium && (
        <div className="panel-card">
          <h3>Mejorá tu cuenta</h3>
          <p>Desbloqueá más herramientas y beneficios exclusivos.</p>

          <button className="config-btn" onClick={upgradeToPremium}>
            Pasar a Premium
          </button>
        </div>
      )}

      {/* ELIMINAR CUENTA PROFESIONAL */}
      <div className="panel-card danger">
        <h3>Eliminar cuenta profesional</h3>
        <button
          className="config-btn-danger"
          onClick={deleteProfessionalAccount}
        >
          Eliminar solo cuenta profesional
        </button>
      </div>

    </div>
  );
}

export default ProfessionalPanel;
