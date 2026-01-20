import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./FeriasPublicadas.css";

export default function FeriasPublicadas() {
  const [ferias, setFerias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔴 Modal eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feriaToDelete, setFeriaToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchFerias = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("ferias")
      .select(`
        id,
        nombre,
        fecha,
        hora,
        is_active,
        banner_url,
        logo_url,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando ferias:", error);
      setError("Error cargando ferias");
      setFerias([]);
    } else {
      setFerias(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFerias();
  }, []);

  /* =====================
     BORRAR IMÁGENES
     ===================== */
  const deleteImages = async (feria) => {
    const paths = [];

    if (feria.banner_url) {
      const bannerPath = feria.banner_url.split(
        "/storage/v1/object/public/ferias/"
      )[1];
      if (bannerPath) paths.push(bannerPath);
    }

    if (feria.logo_url) {
      const logoPath = feria.logo_url.split(
        "/storage/v1/object/public/ferias/"
      )[1];
      if (logoPath) paths.push(logoPath);
    }

    if (paths.length > 0) {
      await supabase.storage.from("ferias").remove(paths);
    }
  };

  /* =====================
     CONFIRMAR ELIMINACIÓN
     ===================== */
  const confirmDeleteFeria = async () => {
    if (!feriaToDelete) return;

    try {
      await deleteImages(feriaToDelete);

      const { error } = await supabase
        .from("ferias")
        .delete()
        .eq("id", feriaToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setFeriaToDelete(null);
      fetchFerias();
    } catch (err) {
      console.error(err);
      alert("Error eliminando la feria");
    }
  };

  if (loading) {
    return <p>Cargando ferias…</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="admin-ferias-page">
      <h1 className="admin-ferias-title">Ferias Publicadas</h1>

      {ferias.length === 0 ? (
        <p>No hay ferias creadas.</p>
      ) : (
        <div className="admin-ferias-list">
          {ferias.map((feria) => (
            <div key={feria.id} className="admin-feria-card">
              <div className="admin-feria-info">
                <h3>{feria.nombre}</h3>

                <p>
                  📅{" "}
                  {new Date(feria.fecha).toLocaleDateString("es-AR")}{" "}
                  — ⏰ {feria.hora}
                </p>

                <p>
                  Estado:{" "}
                  <strong
                    style={{
                      color: feria.is_active
                        ? "#1f7a4d"
                        : "#c0392b",
                    }}
                  >
                    {feria.is_active ? "Activa" : "Inactiva"}
                  </strong>
                </p>
              </div>

              <div className="admin-feria-actions">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    navigate(`/admin/ferias/editar/${feria.id}`)
                  }
                >
                  Editar
                </button>

                <button
                  className="btn-danger"
                  onClick={() => {
                    setFeriaToDelete(feria);
                    setShowDeleteModal(true);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================
          MODAL ELIMINAR
         ===================== */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>¿Eliminar feria?</h3>

            <p>
              Estás a punto de eliminar la feria
              <strong> “{feriaToDelete?.nombre}”</strong>.
              <br />
              Esta acción no se puede deshacer.
            </p>

            <div className="admin-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setFeriaToDelete(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-danger"
                onClick={confirmDeleteFeria}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
