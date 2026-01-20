import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import FeriasAccessModal from "../components/FeriasAccessModal";

function Sidebar() {
  const [open, setOpen] = useState(true);
  const [openLegales, setOpenLegales] = useState(false);

  const [showFeriantesModal, setShowFeriantesModal] = useState(false);
  const [targetTool, setTargetTool] = useState(null);

  const { profile } = useAuth();
  const navigate = useNavigate();

  const isProfessional = profile?.is_professional === true;

  // ⬇️ AJUSTÁ ESTA LÍNEA SI TU FLAG SE LLAMA DISTINTO
  const hasFeriasAccess =
    profile?.tools_access?.includes("ferias") === true;

  return (
    <>
      <aside className={open ? "sidebar open" : "sidebar closed"}>
        {/* BOTÓN TOGGLE */}
        <div
          className="sidebar-toggle-inside"
          onClick={() => setOpen(!open)}
        >
          {open ? "←" : "☰"}
        </div>

        <nav className="sidebar-nav">
          {/* =====================
              MI CUENTA
             ===================== */}
          <Link to="/mi-cuenta">👤 Mi cuenta</Link>

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
              <Link to="/terms">Términos y Condiciones</Link>
              <Link to="/privacy">Política de Privacidad</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          )}

          {/* =====================
              AYUDA
             ===================== */}
          <Link to="/ayuda">🆘 Ayuda</Link>

          {/* =====================
              HERRAMIENTAS PARA FERIANTES
             ===================== */}
          <div className="sidebar-section">
            <div className="sidebar-section-title highlight">
              🎪 Herramientas para Feriantes
            </div>

            {/* FERIAS */}
            <Link
              to="/herramientas/ferias"
              className="sidebar-tool-link"
              onClick={(e) => {
                // 🟢 SI YA TIENE ACCESO → ENTRA DIRECTO
                if (hasFeriasAccess) {
                  return; // deja que el Link navegue
                }

                // 🔴 CASO CONTRARIO → MODAL
                e.preventDefault();
                setTargetTool("ferias");
                setShowFeriantesModal(true);
              }}
            >
              🎟️ Ferias disponibles
            </Link>

            {/* COLABORADORES */}
            <Link
              to="/herramientas/colaboradores"
              className="sidebar-tool-link"
              onClick={(e) => {
                e.preventDefault();
                setTargetTool("colaboradores");
                setShowFeriantesModal(true);
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
          MODAL ÚNICO
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
