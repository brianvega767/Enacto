import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Outlet, useLocation } from "react-router-dom";

function AdminAvisos() {
  const location = useLocation();

  // ✅ Solo mostrar solicitudes de categoría en /admin/avisos
  const isCategoryRequestsPage =
    location.pathname === "/admin/avisos" ||
    location.pathname === "/admin/avisos/";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolEnabled, setToolEnabled] = useState(true);

  // =========================
  // CARGAR ESTADO DE HERRAMIENTA
  // =========================
  useEffect(() => {
    if (!isCategoryRequestsPage) return;

    const loadSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "category_request_enabled")
        .maybeSingle();

      setToolEnabled(data?.value !== false);
    };

    loadSettings();
  }, [isCategoryRequestsPage]);

  // =========================
  // CARGAR SOLICITUDES DE CATEGORÍA
  // =========================
  useEffect(() => {
    if (!isCategoryRequestsPage) return;

    const loadRequests = async () => {
      setLoading(true);

      const { data: reqs, error } = await supabase
        .from("category_requests")
        .select("id, requested_name, created_at, user_id, email")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando solicitudes:", error);
        setLoading(false);
        return;
      }

      if (!reqs || reqs.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(reqs.map(r => r.user_id).filter(Boolean))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const merged = reqs.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      }));

      setRequests(merged);
      setLoading(false);
    };

    loadRequests();
  }, [isCategoryRequestsPage]);

  // =========================
  // TOGGLE HERRAMIENTA
  // =========================
  const toggleTool = async () => {
    const next = !toolEnabled;

    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "category_request_enabled", value: next },
        { onConflict: "key" }
      );

    if (!error) setToolEnabled(next);
  };

  // =========================
  // ELIMINAR SOLICITUD
  // =========================
  const eliminarSolicitud = async (id) => {
    const ok = window.confirm("¿Eliminar esta solicitud?");
    if (!ok) return;

    const { error } = await supabase
      .from("category_requests")
      .delete()
      .eq("id", id);

    if (!error) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div>
      {/* ===== SOLICITUDES DE CATEGORÍA ===== */}
      {isCategoryRequestsPage && (
        <>
          <h1>Avisos</h1>

          <p style={{ maxWidth: "720px", marginBottom: "2.5rem" }}>
            Desde acá podés revisar solicitudes enviadas por los usuarios y administrar herramientas del sistema.
          </p>

          <section className="admin-card" style={{ marginBottom: "3rem" }}>
            <h3>Solicitud de categorías</h3>

            <p style={{ marginTop: "0.6rem" }}>
              Estado actual:&nbsp;
              <strong style={{ color: toolEnabled ? "#059669" : "#b91c1c" }}>
                {toolEnabled ? "Activa" : "Oculta"}
              </strong>
            </p>

            <button
              className="admin-btn"
              style={{ marginTop: "1.2rem" }}
              onClick={toggleTool}
            >
              {toolEnabled ? "Ocultar herramienta" : "Activar herramienta"}
            </button>
          </section>

          <section className="admin-card">
            <h3 style={{ marginBottom: "1.2rem" }}>
              Solicitudes recibidas
            </h3>

            {loading && <p>Cargando solicitudes…</p>}

            {!loading && requests.length === 0 && (
              <p style={{ opacity: 0.7 }}>
                Todavía no se recibieron solicitudes de categorías.
              </p>
            )}

            {!loading && requests.length > 0 && (
              <div>
                {requests.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "14px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      marginBottom: "14px",
                      background: "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <strong>{r.requested_name}</strong>

                      <div style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                        <div>
                          Usuario:&nbsp;
                          <span style={{ fontWeight: 500 }}>
                            {r.profile?.full_name || "—"}
                          </span>
                        </div>

                        <div>
                          Email:&nbsp;
                          <span style={{ opacity: 0.85 }}>
                            {r.email || "—"}
                          </span>
                        </div>

                        <div style={{ marginTop: "6px", opacity: 0.7 }}>
                          Fecha:&nbsp;
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      className="admin-btn"
                      style={{ background: "#ef4444" }}
                      onClick={() => eliminarSolicitud(r.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ===== SUBRUTAS (ej: /admin/avisos/cambio-email) ===== */}
      <Outlet />
    </div>
  );
}

export default AdminAvisos;
