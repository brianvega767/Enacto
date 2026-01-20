import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Colaboradores.css";

export default function Colaboradores() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColaboradores = async () => {
      setLoading(true);

      // ⏱️ solo publicaciones de los últimos 10 días
      const diezDiasAtras = new Date();
      diezDiasAtras.setDate(diezDiasAtras.getDate() - 10);

      await supabase.rpc("limpiar_colaboradores_vencidos");
      
      const { data, error } = await supabase
        .from("colaboradores")
        .select(`
          id,
          nombre,
          categoria,
          busca_categoria,
          tipo_colaboracion,
          descripcion,
          instagram_url,
          whatsapp_phone,
          avatar_url,
          created_at
        `)
        .gte("created_at", diezDiasAtras.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando colaboradores:", error);
        setPublicaciones([]);
      } else {
        setPublicaciones(data || []);
      }

      setLoading(false);
    };

    fetchColaboradores();
  }, []);

  return (
    <div className="colab-layout">
      {/* HEADER */}
      <div className="colab-header">
        {/* Izquierda */}
        <button
          className="colab-back"
          onClick={() => (window.location.href = "/")}
        >
          ← Volver al inicio
        </button>

        {/* Centro */}
        <div className="colab-title-wrapper">
          <h1 className="colab-title">Buscar Colaborador</h1>
          <p className="colab-subtitle">
            Conectate con otros emprendedores para crecer juntos mediante
            sorteos, promociones cruzadas y colaboraciones reales.
          </p>
        </div>

        {/* Derecha */}
        <div className="colab-actions">
          <button
            className="colab-primary"
            onClick={() =>
              (window.location.href =
                "/herramientas/colaboradores/crear")
            }
          >
            + Buscar Colaborador
          </button>

          <button
            className="colab-secondary"
            onClick={() =>
              (window.location.href =
                "/herramientas/colaboradores/mis-publicaciones")
            }
          >
            Mis publicaciones
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="colab-page">
        {loading ? (
          <div className="colab-empty">
            <p>Cargando publicaciones…</p>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="colab-empty">
            <p>
              No hay publicaciones actualmente.
              <br />
              Volvé a intentar pronto o realizá una publicación.
            </p>

            <button
              className="colab-primary"
              onClick={() =>
                (window.location.href =
                  "/herramientas/colaboradores/crear")
              }
            >
              Buscar colaborador
            </button>
          </div>
        ) : (
          <div className="colab-grid">
            {publicaciones.map((pub) => (
              <div key={pub.id} className="colab-card">
                {/* HEADER CARD */}
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

                {/* INFO */}
                <div className="colab-info">
                  <p>
                    <strong>Busca colaborar con:</strong>
                    <br />
                    {pub.busca_categoria}
                  </p>

                  <p>
                    <strong>Tipo de colaboración:</strong>
                    <br />
                    {pub.tipo_colaboracion}
                  </p>

                  {pub.descripcion && (
                    <p>
                      <strong>Descripción:</strong>
                      <br />
                      {pub.descripcion}
                    </p>
                  )}
                </div>

                {/* ACCIONES */}
                <div className="colab-actions-card">
                  {pub.instagram_url && (
                    <a
                      href={pub.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-instagram"
                    >
                      Instagram
                    </a>
                  )}

                  {pub.whatsapp_phone && (
                    <a
                      href={`https://wa.me/${pub.whatsapp_phone}?text=${encodeURIComponent(
                        `Hola! Vi tu publicación en Conecta y me interesa colaborar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-contactar"
                    >
                      Contactar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
