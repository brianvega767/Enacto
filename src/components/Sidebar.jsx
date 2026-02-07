import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import FeriasAccessModal from "../components/FeriasAccessModal";
import PremiumToolModal from "../components/PremiumToolModal";

function Sidebar() {
  const [openLegales, setOpenLegales] = useState(false);
  const [showFeriantesModal, setShowFeriantesModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [targetTool, setTargetTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { profile } = useAuth();
  const navigate = useNavigate();

  const isPremium = profile?.is_premium === true;

  const hasFeriasAccess =
    profile?.tools_access?.includes("ferias") === true;

  // 🔹 Manejo sidebar SOLO en mobile
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile && isMobileOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [isMobileOpen]);

  const handlePremiumToolClick = (tool, targetPath) => {
    if (!isPremium) {
      setTargetTool(tool);
      setShowPremiumModal(true);
      return;
    }

    navigate(targetPath);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 🔘 BOTÓN SOLO MOBILE */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link to="/mi-cuenta" onClick={() => setIsMobileOpen(false)}>
            👤 Mi cuenta
          </Link>

          <button
            type="button"
            className="sidebar-link-button"
            onClick={() => setOpenLegales(!openLegales)}
          >
            📄 Legales {openLegales ? "▾" : "▸"}
          </button>

          {openLegales && (
            <div className="sidebar-submenu">
              <Link to="/terms">Términos y Condiciones</Link>
              <Link to="/privacy">Política de Privacidad</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          )}

          <Link to="/ayuda" onClick={() => setIsMobileOpen(false)}>
            🆘 Ayuda
          </Link>

          {/* 🔹 NUEVO BOTÓN */}
          <Link to="/sobre-enacto" onClick={() => setIsMobileOpen(false)}>
            ℹ️ Sobre Enacto
          </Link>

          {/* =====================
              HERRAMIENTAS PARA FERIANTES
             ===================== */}
          <div className="sidebar-section">
            <div className="sidebar-section-title highlight">
              🎪 Herramientas para Feriantes
            </div>

            <Link
              to="/herramientas/ferias"
              className="sidebar-tool-link"
              onClick={(e) => {
                if (!hasFeriasAccess) {
                  e.preventDefault();
                  setTargetTool("ferias");
                  setShowFeriantesModal(true);
                }
                setIsMobileOpen(false);
              }}
            >
              🎟️ Ferias disponibles
            </Link>

            <Link
              to="/herramientas/colaboradores"
              className="sidebar-tool-link"
              onClick={(e) => {
                e.preventDefault();
                setTargetTool("colaboradores");
                setShowFeriantesModal(true);
                setIsMobileOpen(false);
              }}
            >
              🤝 Buscar colaborador
            </Link>
          </div>

          {/* =====================
              HERRAMIENTAS PREMIUM
             ===================== */}
          <div className="sidebar-section">
            <div className="sidebar-section-title highlight">
              💎 Herramientas Premium
            </div>

            <button
              className="sidebar-tool-link"
              onClick={() =>
                handlePremiumToolClick(
                  "textos",
                  "/herramientas/generador-textos"
                )
              }
            >
              🧠 Generador de textos
            </button>

            <button
              className="sidebar-tool-link"
              onClick={() =>
                handlePremiumToolClick(
                  "estrategias",
                  "/herramientas/estrategias"
                )
              }
            >
              🚀 Generador de estrategias
            </button>
          </div>
        </nav>
      </aside>

      {/* =====================
          MODALES
         ===================== */}
      {showFeriantesModal && (
        <FeriasAccessModal
          targetTool={targetTool}
          onClose={() => {
            setShowFeriantesModal(false);
            setTargetTool(null);
          }}
        />
      )}

      {showPremiumModal && (
        <PremiumToolModal
          tool={targetTool}
          onClose={() => {
            setShowPremiumModal(false);
            setTargetTool(null);
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
