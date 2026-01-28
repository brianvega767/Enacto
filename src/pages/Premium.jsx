import "./Premium.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Premium() {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium === true;
  const navigate = useNavigate();

  return (
    <div className="premium-page">
      <div className="premium-wrapper">
        {/* BOTÓN VOLVER */}
        <button
          className="premium-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        {/* HERO */}
        <div className="premium-hero">
          <h1>Profinder Premium</h1>
          <p className="premium-subtitle">
            Herramientas inteligentes para emprendedores que quieren
            organizar mejor su comunicación y sus estrategias comerciales.
          </p>
        </div>

        {/* CARD */}
        <div className="premium-card">
          <h2>¿Qué incluye Premium?</h2>

          <ul className="premium-features">
            <li>
              🧠 <strong>Asistente de textos comerciales</strong>
              <span>
                Ayuda para redactar textos claros y profesionales para
                productos y servicios.
              </span>
            </li>

            <li>
              🚀 <strong>Asistente de estrategias comerciales</strong>
              <span>
                Ideas y sugerencias para pensar acciones comerciales,
                promociones y contenido.
              </span>
            </li>

            <li>
              ✨ <strong>Acceso anticipado</strong>
              <span>
                Nuevas herramientas y funciones premium que se irán
                sumando.
              </span>
            </li>
          </ul>

          <div className="premium-price-box">
            <div className="price">
              $15.000 <span>+ impuestos / mes</span>
            </div>

            {!isPremium ? (
              <button className="premium-cta">
                Suscribirme a Premium
              </button>
            ) : (
              <div className="already-premium">
                ✔️ Ya sos usuario Premium
              </div>
            )}
          </div>

          <p className="premium-legal">
            Las herramientas brindan ideas y sugerencias. Los resultados
            dependen de múltiples factores externos al uso de la
            plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Premium;
