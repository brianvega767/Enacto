import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Ferias.css";

export default function Ferias() {
  const [ferias, setFerias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    const fetchFerias = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("ferias")
        .select(`
          id,
          nombre,
          descripcion,
          fecha,
          hora,
          banner_url,
          logo_url,
          whatsapp_phone
        `)
        .eq("is_active", true)
        .order("fecha", { ascending: true });

      if (error) {
        console.error("Error cargando ferias:", error);
        setFerias([]);
      } else {
        setFerias(data || []);
      }

      setLoading(false);
    };

    fetchFerias();
  }, []);

  return (
    <div className="ferias-layout">
      {/* Header */}
      <div className="ferias-header">
        <button
          className="ferias-back"
          onClick={() => (window.location.href = "/")}
        >
          ← Volver al Inicio
        </button>

        <h1 className="ferias-title">Ferias disponibles</h1>

        <button
          className="ferias-publish"
          onClick={() => setShowPublishModal(true)}
        >
          Publicar una Feria
        </button>
      </div>

      {/* Contenido */}
      <div className="ferias-page">
        {loading ? (
          <div className="ferias-empty">
            <p>Cargando ferias...</p>
          </div>
        ) : ferias.length === 0 ? (
          <div className="ferias-empty">
            <p>
              No hay eventos publicados actualmente,
              <br />
              vuelva a probar pronto!
            </p>

            <button
              className="ferias-empty-back"
              onClick={() => (window.location.href = "/")}
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          ferias.map((feria) => (
            <div key={feria.id} className="feria-card">
              {/* Banner */}
              <div className="feria-banner">
                {feria.banner_url && (
                  <img
                    className="feria-banner-img"
                    src={feria.banner_url}
                    alt={feria.nombre}
                  />
                )}

                {/* Logo */}
                {feria.logo_url && (
                  <div className="feria-logo">
                    <img src={feria.logo_url} alt="Logo feria" />
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="feria-content">
                <h2 className="feria-nombre">{feria.nombre}</h2>

                <div className="feria-meta">
                  <span>
                    <strong>Fecha:</strong>{" "}
                    {new Date(feria.fecha).toLocaleDateString("es-AR")}
                  </span>
                  <span>
                    <strong>Hora:</strong> {feria.hora}
                  </span>
                </div>

                <p className="feria-descripcion">
                  {feria.descripcion}
                </p>

                <div className="feria-action">
                  <a
                    className="feria-contactar"
                    href={`https://wa.me/${feria.whatsapp_phone}?text=${encodeURIComponent(
                      `Hola, vi la feria "${feria.nombre}" en Enacto y me gustaría recibir información para participar con un stand. ¡Gracias!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Publicar Feria */}
      {showPublishModal && (
        <div
          className="publish-modal-overlay"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="publish-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>¿Organizás una feria o evento?</h2>

            <p>
              Publicá tu evento acá y llegá directamente a emprendedores y feriantes interesados en participar con sus stands.
              <br /><br />
              Contactate con el administrador y coordinamos la publicación.
            </p>

            <a
              href={`https://wa.me/5493425103292?text=${encodeURIComponent(
                "Hola! Me gustaría publicar mi evento en su página web!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="publish-modal-contact"
            >
              Contactar al administrador
            </a>

            <button
              className="publish-modal-close"
              onClick={() => setShowPublishModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
