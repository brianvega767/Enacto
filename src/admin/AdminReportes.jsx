import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./admin.css";

function AdminReportes() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  const loadReports = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("account_reports")
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        reporter:profiles!account_reports_reporter_fkey (
          id,
          full_name,
          slug
        ),
        reported:profiles!account_reports_reported_fkey (
          id,
          full_name,
          slug,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando reportes:", error);
      setReports([]);
    } else {
      setReports(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const toggleAccountStatus = async (profileId, currentStatus) => {
    const action =
      currentStatus === "active" ? "suspender" : "reactivar";

    const ok = window.confirm(
      `¿Seguro que querés ${action} esta cuenta?`
    );

    if (!ok) return;

    setWorkingId(profileId);

    const { error } = await supabase
      .from("profiles")
      .update({
        status: currentStatus === "active" ? "suspended" : "active",
      })
      .eq("id", profileId);

    if (error) {
      console.error("Error actualizando estado:", error);
      alert("No se pudo actualizar el estado de la cuenta.");
    } else {
      await loadReports();
    }

    setWorkingId(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Reportes de perfiles</h1>

      {loading && <p>Cargando reportes…</p>}

      {!loading && reports.length === 0 && (
        <p>No hay denuncias registradas.</p>
      )}

      <div className="admin-cards">
        {reports.map((r) => (
          <div key={r.id} className="admin-card">
            <div className="admin-card-header">
              <span className="admin-badge">{r.reason}</span>
              <span className="admin-date">
                {new Date(r.created_at).toLocaleDateString("es-AR")}
              </span>
            </div>

            <div className="admin-card-section">
              <strong>Denunciante:</strong>{" "}
              {r.reporter?.full_name || "—"}
              {r.reporter?.slug && (
                <Link
                  to={`/perfil/${r.reporter.slug}`}
                  target="_blank"
                  className="admin-link"
                >
                  Ver perfil
                </Link>
              )}
            </div>

            <div className="admin-card-section">
              <strong>Denunciado:</strong>{" "}
              {r.reported?.full_name || "—"}
              {r.reported?.slug && (
                <Link
                  to={`/perfil/${r.reported.slug}`}
                  target="_blank"
                  className="admin-link"
                >
                  Ver perfil
                </Link>
              )}
            </div>

            {r.description && (
              <p className="admin-description">
                “{r.description}”
              </p>
            )}

            <div className="admin-card-footer">
              <span
                className={`admin-status ${r.reported?.status}`}
              >
                Estado cuenta: {r.reported?.status}
              </span>

              {r.reported?.id && (
                <button
                  className={`admin-action-btn ${
                    r.reported.status === "active"
                      ? "danger"
                      : "success"
                  }`}
                  disabled={workingId === r.reported.id}
                  onClick={() =>
                    toggleAccountStatus(
                      r.reported.id,
                      r.reported.status
                    )
                  }
                >
                  {workingId === r.reported.id
                    ? "Procesando…"
                    : r.reported.status === "active"
                    ? "Suspender cuenta"
                    : "Reactivar cuenta"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReportes;
