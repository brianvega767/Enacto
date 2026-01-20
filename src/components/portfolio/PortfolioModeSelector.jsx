import { useNavigate } from "react-router-dom";

function PortfolioModeSelector({ modo, setModo, esPremium }) {
  const navigate = useNavigate();

  const selectUniforme = () => {
    setModo("uniforme");
  };

  const selectDinamico = () => {
    if (!esPremium) return;
    setModo("dinamico");
  };

  return (
    <div className="portfolio-mode-selector-wrapper">
      <div className="portfolio-mode-selector">

        {/* ✅ TARJETA UNIFORME */}
        <div
          className={`mode-card ${modo === "uniforme" ? "active" : ""}`}
          onClick={selectUniforme}
        >
          <div className="mode-header">
            <span className="mode-title">Estilo uniforme</span>
            {modo === "uniforme" && <span className="mode-check">✔</span>}
          </div>

          <p className="mode-desc">
            Cuadrícula simple y ordenada.  
            Todas las imágenes del mismo tamaño.
          </p>

          <button className="mode-btn">
            Usar este estilo
          </button>
        </div>

        {/* ✅ CONTENEDOR RELATIVO PARA DINÁMICO + POPUP */}
        <div className="mode-dinamico-wrapper">

          {/* ✅ TARJETA DINÁMICA */}
          <div
            className={`mode-card ${
              !esPremium ? "locked" : modo === "dinamico" ? "active" : ""
            } mode-dinamico-card`}
            onClick={selectDinamico}
          >
            <div className="mode-header">
              <span className="mode-title">Estilo dinámico (Premium)</span>
              {!esPremium ? (
                <span className="mode-lock">🔒</span>
              ) : (
                modo === "dinamico" && <span className="mode-check">✔</span>
              )}
            </div>

            <p className="mode-desc">
              Cuadrículas dinámicas con imágenes grandes, medianas y chicas.
              Mayor impacto visual.
            </p>

            <button className={`mode-btn ${!esPremium ? "locked-btn" : ""}`}>
              Usar este estilo
            </button>
          </div>

          {/* ✅ POPUP ANCLADO A LA TARJETA */}
          {!esPremium && (
            <div className="premium-hover-pop">
              <p className="premium-side-text">
                Herramienta exclusiva de usuarios premium
              </p>

              <button
                className="premium-side-btn"
                onClick={() => navigate("/premium")}
              >
                Ver planes
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default PortfolioModeSelector;
