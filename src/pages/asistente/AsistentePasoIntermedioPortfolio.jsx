import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastGlobal"; // 🔥 Toast global
import "../../App.css";

function AsistentePasoIntermedioPortfolio() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className="asistente-page asistente-blur-bg">
      {/* 🔙 BOTÓN VOLVER */}
      <button className="asistente-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      {/* 🔥 CONTENEDOR CENTRADO */}
      <div className="intermedio-box">
        <h1 className="intermedio-title">¡Felicitaciones! 🎉</h1>

        <p className="intermedio-subtitle">
          Tu cuenta profesional ya está casi lista.
        </p>

        <p className="intermedio-text">
          Solo te queda un paso opcional:
          podés subir contenido a tu portfolio ahora
          o hacerlo más adelante cuando quieras.
        </p>

        <div className="intermedio-actions">
          {/* 👉 IR A CREAR EL PORTFOLIO AHORA */}
          <button
            className="intermedio-btn primary"
            onClick={() => navigate("/asistente-profesional/paso-4")}
          >
            Crear portfolio ahora
          </button>

          {/* 👉 HACERLO LUEGO → IR A MI CUENTA */}
          <button
            className="intermedio-btn secondary"
            onClick={() => {
              showToast(
                "Podés cargar tu portfolio más adelante desde Mi cuenta."
              );
              navigate("/mi-cuenta");
            }}
          >
            Hacerlo luego
          </button>
        </div>
      </div>
    </div>
  );
}

export default AsistentePasoIntermedioPortfolio;
