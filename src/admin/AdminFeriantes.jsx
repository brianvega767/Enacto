import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./admin.css";

function AdminFeriantes() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    // 1️⃣ Traer solicitudes
    const { data: reqs, error: reqError } = await supabase
      .from("tool_access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (reqError) {
      console.error(reqError);
      setError("No se pudieron cargar las solicitudes.");
      setLoading(false);
      return;
    }

    if (!reqs || reqs.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // 2️⃣ Traer perfiles asociados (incluye slug)
    const userIds = [...new Set(reqs.map((r) => r.user_id))];

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, slug, is_professional")
      .in("id", userIds);

    if (profileError) {
      console.error(profileError);
      setError("No se pudieron cargar los perfiles.");
      setLoading(false);
      return;
    }

    // 3️⃣ Merge solicitudes + perfiles
    const merged = reqs.map((r) => ({
      ...r,
      profile: profiles.find((p) => p.id === r.user_id),
    }));

    setRequests(merged);
    setLoading(false);
  };

  const approveRequest = async (id) => {
    const { error } = await supabase
      .from("tool_access_requests")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      alert("Error al aprobar la solicitud");
      return;
    }

    fetchRequests();
  };

  const deleteRequest = async (id) => {
    const ok = window.confirm(
      "¿Seguro que querés eliminar esta solicitud?"
    );
    if (!ok) return;

    const { error } = await supabase
      .from("tool_access_requests")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar la solicitud");
      return;
    }

    fetchRequests();
  };

  /* =====================
     ESTADOS
     ===================== */

  if (loading) {
    return <div className="admin-page">Cargando solicitudes…</div>;
  }

  if (error) {
    return <div className="admin-page error">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1 style={{ marginBottom: "1.5rem" }}>
        Solicitudes de acceso a herramientas
      </h1>

      {requests.length === 0 && (
        <p style={{ color: "#555" }}>
          No hay solicitudes por el momento.
        </p>
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
              padding: "1.4rem",
              borderRadius: "14px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
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
              <strong>
                {r.profile?.full_name || "Sin nombre"}
              </strong>

              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#777",
                }}
              >
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>

            {/* EMAIL */}
            <div
              style={{
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "0.6rem",
              }}
            >
              {r.profile?.email || "—"}
            </div>

            {/* INFO */}
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Herramienta solicitada:{" "}
              <strong>{r.tool_key}</strong>
            </div>

            {/* ACCIONES */}
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                alignItems: "center",
              }}
            >
              {/* VER PERFIL PÚBLICO */}
              {r.profile?.slug && (
                <button
                  className="admin-btn secondary"
                  onClick={() =>
                    navigate(`/perfil/${r.profile.slug}`)
                  }
                >
                  Ver perfil
                </button>
              )}

              {/* APROBAR */}
              {r.status !== "approved" && (
                <button
                  className="admin-btn"
                  onClick={() => approveRequest(r.id)}
                >
                  Aprobar
                </button>
              )}

              {/* ELIMINAR */}
              <button
                className="admin-btn secondary"
                onClick={() => deleteRequest(r.id)}
              >
                Eliminar
              </button>

              {/* ESTADO */}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.85rem",
                  color:
                    r.status === "approved"
                      ? "green"
                      : r.status === "pending"
                      ? "#b36b00"
                      : "#777",
                }}
              >
                Estado: {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminFeriantes;
