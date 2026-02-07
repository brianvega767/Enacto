import "./SobreEnacto.css";
import { Link } from "react-router-dom";

function SobreEnacto() {
  return (
    <main className="sobre-enacto">
      <section className="sobre-enacto-container">
        {/* =====================
            VISIÓN / META
        ===================== */}
        <h1>Estamos creando la comunidad de emprendedores más grande de la ciudad</h1>

        <p className="intro">
          Enacto nace con un objetivo claro: conectar, visibilizar y potenciar a
          los emprendedores y profesionales locales en un solo lugar.
        </p>

        <p>
          Queremos que emprender no sea algo solitario. Que cada persona que
          ofrece un servicio o producto pueda formar parte de una comunidad
          real, con herramientas y oportunidades concretas.
        </p>

        {/* =====================
            CÓMO SER PARTE
        ===================== */}
        <h2>¿Cómo ser parte de la comunidad?</h2>

        <p>
          Ser parte de Enacto es simple. Estamos construyendo la comunidad paso a
          paso, empezando por quienes ya están emprendiendo hoy.
        </p>

        {/* =====================
            PASO 1
        ===================== */}
        <div className="paso">
          <h3>1️⃣ Sumate al grupo de WhatsApp</h3>
          <p>
            El grupo de WhatsApp es el punto de encuentro de la comunidad:
            novedades, colaboración entre emprendedores y crecimiento conjunto.
          </p>

          <a
            href="https://chat.whatsapp.com/KqydZBhcy7X5dowA6sThLl?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Unirme al grupo de WhatsApp
          </a>
        </div>

        {/* =====================
            PASO 2
        ===================== */}
        <div className="paso">
          <h3>2️⃣ Creá tu cuenta profesional en Enacto</h3>
          <p>
            Al crear tu cuenta profesional podés mostrar lo que hacés, recibir
            consultas y formar parte activa de la plataforma.
          </p>

          <Link to="https://enacto.vercel.app/asistente-profesional/paso-1" className="btn btn-secondary">
            Crear cuenta profesional
          </Link>
        </div>

        {/* =====================
            QUÉ ES ENACTO
        ===================== */}
        <h2>¿Qué es Enacto?</h2>

        <p>
          Enacto es una plataforma pensada para emprendedores y profesionales
          independientes que quieren organizar su presencia, mostrar sus
          servicios y conectar con nuevas oportunidades.
        </p>

        <ul>
          <li>📌 Perfiles profesionales públicos</li>
          <li>📌 Visibilidad para servicios y productos</li>
          <li>📌 Herramientas para emprender mejor</li>
          <li>📌 Comunidad y colaboración entre emprendedores</li>
        </ul>

        <p>
          Nuestra visión a futuro es construir un ecosistema donde emprender sea
          más simple, más visible y más humano.
        </p>

        {/* =====================
            VOLVER
        ===================== */}
        <div className="volver-inicio">
          <Link to="/" className="btn btn-link">
            ← Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

export default SobreEnacto;
