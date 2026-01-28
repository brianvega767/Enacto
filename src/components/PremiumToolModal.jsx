import "./PremiumToolModal.css";
import { Link } from "react-router-dom";

const TOOL_IN_CONSTRUCTION = true;

function PremiumToolModal({ tool, onClose }) {
  const contentByTool = {
    textos: {
      title: "Asistente de textos comerciales",
      description:
        "Una herramienta que te ayuda a redactar textos claros y profesionales para presentar tus productos o servicios en distintas plataformas.",
      features: [
        "🛍️ Ideas de descripciones de productos",
        "📸 Textos adaptados a redes sociales y mensajería",
        "🎯 Diferentes estilos y tonos de comunicación",
        "✨ Apoyo para comunicar mejor tu propuesta",
      ],
    },
    estrategias: {
      title: "Asistente de estrategias comerciales",
      description:
        "Una herramienta que brinda ideas y sugerencias para pensar acciones comerciales, contenido y propuestas según tu tipo de negocio.",
      features: [
        "📈 Ideas para organizar acciones comerciales",
        "📣 Sugerencias de contenido",
        "🧲 Propuestas para atraer clientes",
        "💰 Enfoques para estructurar precios y ofertas",
        "🛍️ Ideas de promociones y combos",
        "🧠 Apoyo para definir tu posicionamiento",
      ],
    },
  };

  const content = contentByTool[tool];
  if (!content) return null;

  return (
    <div className="premium-modal-backdrop">
      <div className="premium-modal">
        {TOOL_IN_CONSTRUCTION ? (
          <>
            <h2>Herramienta en construcción</h2>
            <p>
              Estamos trabajando para traerte esta funcionalidad muy pronto.
            </p>

            <div className="premium-modal-actions">
              <button
                className="premium-btn secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{content.title}</h2>
            <p>{content.description}</p>

            <ul className="premium-feature-list">
              {content.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <div className="premium-modal-actions">
              <Link to="/premium" className="premium-btn">
                ✨ Ser Premium
              </Link>

              <button
                className="premium-btn secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PremiumToolModal;
