import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AdminEmailChangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // CARGAR SOLICITUDES
  // =========================
  const loadRequests = async () => {
    setLoading(true);

    const { data, error } = await supabase
  .rpc("admin_list_email_change_requests");


    if (!error) {
      setRequests(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // =========================
  // ELIMINAR SOLICITUD
  // =========================
  const handleDelete = async (id) => {
    const ok = window.confirm(
      "¿Seguro que querés eliminar esta solicitud?\nEsta acción no se puede deshacer."
    );

    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("email_change_requests")
      .delete()
      .eq("id", id);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("No se pudo eliminar la solicitud.");
    }

    setDeletingId(null);
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1>Solicitudes de cambio de email</h1>

      {loading && <p>Cargando…</p>}

      {!loading && requests.length === 0 && (
        <p>No hay solicitudes pendientes.</p>
      )}

      {!loading &&
        requests.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <p>
              <strong>Email actual:</strong> {r.email_actual}
            </p>

            <p>
              <strong>Email nuevo:</strong> {r.email_nuevo}
            </p>

            {r.telefono && (
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a
                  href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#2563eb" }}
                >
                  {r.telefono}
                </a>
              </p>
            )}

            <p style={{ fontSize: "12px", color: "#666" }}>
              {new Date(r.created_at).toLocaleString()}
            </p>

            {/* ===== ACCIONES ===== */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: deletingId === r.id ? 0.6 : 1,
                }}
              >
                {deletingId === r.id
                  ? "Eliminando…"
                  : "Eliminar"}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default AdminEmailChangeRequests;
