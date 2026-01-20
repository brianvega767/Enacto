import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./admin.css";

function AdminLayout() {
  const location = useLocation();

  const [avisosOpen, setAvisosOpen] = useState(
    location.pathname.startsWith("/admin/avisos")
  );

  // 🔴 Estados de notificaciones
  const [hasNewHelp, setHasNewHelp] = useState(false);
  const [hasCategoryRequests, setHasCategoryRequests] = useState(false);
  const [hasEmailChangeRequests, setHasEmailChangeRequests] = useState(false);
  const [hasToolAccessRequests, setHasToolAccessRequests] = useState(false);

  // 🔴 Chequeo periódico de notificaciones
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const { count: helpCount } = await supabase
          .from("help_requests")
          .select("*", { count: "exact", head: true })
          .eq("seen", false);

        setHasNewHelp((helpCount ?? 0) > 0);

        const { count: categoryCount } = await supabase
          .from("category_requests")
          .select("*", { count: "exact", head: true })
          .eq("seen", false);

        setHasCategoryRequests((categoryCount ?? 0) > 0);

        const { count: emailChangeCount } = await supabase
          .from("email_change_requests")
          .select("*", { count: "exact", head: true })
          .eq("seen", false);

        setHasEmailChangeRequests((emailChangeCount ?? 0) > 0);

        const { count: toolAccessCount } = await supabase
          .from("tool_access_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setHasToolAccessRequests((toolAccessCount ?? 0) > 0);
      } catch (err) {
        console.error("Error checking admin notifications:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const hasAnyAvisos =
    hasCategoryRequests ||
    hasEmailChangeRequests ||
    hasToolAccessRequests;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">👑 Admin</h2>

        <nav className="admin-nav">
          {/* =====================
              LINKS PRINCIPALES
             ===================== */}
          <Link to="/admin">Dashboard</Link>

          <Link to="/admin/categories/">
            Categorías
          </Link>

          {/* =====================
              FERIAS
             ===================== */}
          <Link to="/admin/ferias/crear">
            Crear Ferias
          </Link>

          <Link to="/admin/ferias">
            Ferias Publicadas
          </Link>

          {/* =====================
              REPORTES (NUEVO)
             ===================== */}
          <Link to="/admin/reportes">
            Reportes
          </Link>

          {/* =====================
              AVISOS (DESPLEGABLE)
             ===================== */}
          <div className="admin-nav-group">
            <button
              type="button"
              onClick={() => setAvisosOpen((v) => !v)}
              className="admin-nav-button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <span>Avisos {avisosOpen ? "▾" : "▸"}</span>

              {hasAnyAvisos && (
                <span className="admin-help-dot" />
              )}
            </button>

            {avisosOpen && (
              <div className="admin-subnav">
                <Link
                  to="/admin/avisos"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span>Solicitudes de categoría</span>

                  {hasCategoryRequests && (
                    <span className="admin-help-dot" />
                  )}
                </Link>

                <Link
                  to="/admin/avisos/cambio-email"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span>Solicitud cambio de email</span>

                  {hasEmailChangeRequests && (
                    <span className="admin-help-dot" />
                  )}
                </Link>

                <Link
                  to="/admin/avisos/herramientas"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <span>Solicitud acceso a herramientas</span>

                  {hasToolAccessRequests && (
                    <span className="admin-help-dot" />
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* =====================
              AYUDA
             ===================== */}
          <div className="admin-nav-group">
            <Link
              to="/admin/ayuda"
              className="admin-help-link"
            >
              <span>Ayuda</span>

              {hasNewHelp && (
                <span className="admin-help-dot" />
              )}
            </Link>
          </div>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
