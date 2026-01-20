import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./Colaboradores.css";

export default function MisPublicaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toDelete, setToDelete] = useState(null); // publicación seleccionada
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchMisPublicaciones = async () => {
      setLoading(true);
      setError(null);
      
      await supabase.rpc("limpiar_colaboradores_vencidos");

      const { data, error } = await supabase
        .from("colaboradores")
        .select(`
          id,
          nombre,
          categoria,
          tipo_colaboracion,
          created_at,
          avatar_url
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("No se pudieron cargar tus publicaciones.");
        setPublicaciones([]);
      } else {
        setPublicaciones(data || []);
      }

      setLoading(false);
    };

    fetchMisPublicaciones();
  }, [user]);

  const confirmarEliminar = (pub) => {
    setToDelete(pub);
  };

  const eliminarPublicacion = async () => {
    if (!toDelete) return;

    setDeleting(true);

    const { error } = await supabase
      .from("colaboradores")
      .delete()
      .eq("id", toDelete.id)
      .eq("user_id", user.id);

    if (error) {
      alert("Error al eliminar la publicación.");
      setDeleting(false);
      return;
    }

    setPublicaciones((prev) =>
      prev.filter((p) => p.id !== toDelete.id)
    );

    setToDelete(null);
    setDeleting(false);
  };

  const calcularDiasRestantes = (createdAt) => {
    const diasPasados = Math.floor(
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, 10 - diasPasados);
  };

  return (
    <div className="colab-layout">
      {/* HEADER */}
      <div className="colab-header">
        <button className="colab-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="colab-title-wrapper">
          <h1 className="colab-title">Mis publicaciones</h1>
          <p className="colab-subtitle">
            Estas son tus búsquedas activas de colaboradores.
            <br />
            Cada publicación se elimina automáticamente a los 10 días.
          </p>
        </div>

        <div />
      </div>

      {/* CONTENIDO */}
      <div className="colab-page">
        {loading ? (
          <div className="colab-empty">
            <p>Cargando tus publicaciones…</p>
          </div>
        ) : error ? (
          <div className="colab-empty">
            <p>{error}</p>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="colab-empty">
            <p>No tenés publicaciones activas.</p>

            <button
              className="colab-primary"
              onClick={() =>
                navigate("/herramientas/colaboradores/crear")
              }
            >
              Crear publicación
            </button>
          </div>
        ) : (
          <div className="colab-grid">
            {publicaciones.map((pub) => {
              const diasRestantes = calcularDiasRestantes(pub.created_at);

              return (
                <div key={pub.id} className="colab-card">
                  <div className="colab-card-header">
                    {pub.avatar_url ? (
                      <img
                        src={pub.avatar_url}
                        alt={pub.nombre}
                        className="colab-avatar"
                      />
                    ) : (
                      <div className="colab-avatar">
                        {pub.nombre.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h3>{pub.nombre}</h3>
                      <span className="colab-category">
                        {pub.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="colab-info">
                    <p>
                      <strong>Tipo de colaboración:</strong>
                      <br />
                      {pub.tipo_colaboracion}
                    </p>

                    <p>
                      <strong>Estado:</strong>
                      <br />
                      {diasRestantes > 1 && (
                        <span style={{ color: "#1f7a4d", fontWeight: 600 }}>
                          Se eliminará en {diasRestantes} días
                        </span>
                      )}

                      {diasRestantes === 1 && (
                        <span style={{ color: "#d35400", fontWeight: 700 }}>
                          Último día visible
                        </span>
                      )}

                      {diasRestantes === 0 && (
                        <span style={{ color: "#c0392b", fontWeight: 700 }}>
                          Por eliminarse
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="colab-actions-card">
                    <button
                      className="btn-contactar"
                      style={{ background: "#c0392b" }}
                      onClick={() => confirmarEliminar(pub)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL ELIMINAR */}
      {toDelete && (
        <div className="colab-modal-overlay">
          <div className="colab-modal">
            <h2>Eliminar publicación</h2>

            <p className="modal-text">
              ¿Estás seguro de que querés eliminar la publicación
              <strong> “{toDelete.nombre}”</strong>?
              <br /><br />
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-actions">
              <button
                className="modal-button secondary"
                onClick={() => setToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                className="modal-button danger"
                onClick={eliminarPublicacion}
                disabled={deleting}
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
