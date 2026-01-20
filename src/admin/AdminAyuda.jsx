import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./admin.css";

function AdminAyuda() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const { data, error } = await supabase
          .from("help_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRequests(data || []);

        // 🔴 Marcar como vistas las no vistas
        const unseenIds = (data || [])
          .filter((r) => r.seen === false)
          .map((r) => r.id);

        if (unseenIds.length > 0) {
          await supabase
            .from("help_requests")
            .update({ seen: true })
            .in("id", unseenIds);
        }
      } catch (err) {
        console.error(err);
        setError(
          "No se pudieron cargar las solicitudes de ayuda."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, []);

  // 🗑️ Eliminar solicitud
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Eliminar esta solicitud de ayuda?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("help_requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("No se pudo eliminar la solicitud.");
      return;
    }

    // Quitar del estado local sin recargar
    setRequests((prev) =>
      prev.filter((r) => r.id !== id)
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        Cargando solicitudes de ayuda…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#b00020" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>
        Solicitudes de ayuda
      </h1>

      {requests.length === 0 && (
        <p>No hay solicitudes por el momento.</p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
        }}
      >
        {requests.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "1.4rem",
              boxShadow:
                "0 12px 30px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.6rem",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>
                {r.name}
              </strong>

              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#777",
                }}
              >
                {new Date(
                  r.created_at
                ).toLocaleString()}
              </span>
            </div>

            {/* EMAIL */}
            <div
              style={{
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "0.8rem",
              }}
            >
              {r.email}
            </div>

            {/* MENSAJE */}
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.5",
              }}
            >
              {r.message}
            </p>

            {/* ACCIONES */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={() => handleDelete(r.id)}
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "0.4rem 0.9rem",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "#b00020",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAyuda;
