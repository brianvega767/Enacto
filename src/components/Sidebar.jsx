import "./Sidebar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import FeriasAccessModal from "../components/FeriasAccessModal";

function Sidebar() {
  const [openLegales, setOpenLegales] = useState(false);
  const [showFeriantesModal, setShowFeriantesModal] = useState(false);
  const [targetTool, setTargetTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { profile } = useAuth();

  const isProfessional = profile?.is_professional === true;
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
          {/* =====================
              MI CUENTA
             ===================== */}
          <Link to="/mi-cuenta" onClick={() => setIsMobileOpen(false)}>
            👤 Mi cuenta
          </Link>

          {/* =====================
              LEGALES
             ===================== */}
          <button
            type="button"
            className="sidebar-link-button"
            onClick={() => setOpenLegales(!openLegales)}
          >
            📄 Legales {openLegales ? "▾" : "▸"}
          </button>

          {openLegales && (
            <div className="sidebar-submenu">
              <Link to="/terms" onClick={() => setIsMobileOpen(false)}>
                Términos y Condiciones
              </Link>
              <Link to="/privacy" onClick={() => setIsMobileOpen(false)}>
                Política de Privacidad
              </Link>
              <Link to="/cookies" onClick={() => setIsMobileOpen(false)}>
                Cookies
              </Link>
            </div>
          )}

          {/* =====================
              AYUDA
             ===================== */}
          <Link to="/ayuda" onClick={() => setIsMobileOpen(false)}>
            🆘 Ayuda
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
              HERRAMIENTAS PROFESIONALES
             ===================== */}
          {isProfessional && (
            <div className="sidebar-section">
              <div className="sidebar-section-title subtle">
                🔧 Herramientas para profesionales
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* =====================
          MODAL DE ACCESO
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
    </>
  );
}

export default Sidebar;
