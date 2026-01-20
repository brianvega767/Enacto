import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function TermsPage() {
  const [offset, setOffset] = useState(0);

  // =========================
  // OFFSET HEADER + CATEGORIES
  // =========================
  useEffect(() => {
    function updateOffset() {
      const header = document.querySelector(".header");
      const categories = document.querySelector(".categories-bar");

      let total = 0;
      if (header) total += header.getBoundingClientRect().height;
      if (categories && !categories.classList.contains("hidden")) {
        total += categories.getBoundingClientRect().height;
      }

      setOffset(total + 24);
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    window.addEventListener("scroll", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset);
    };
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="main-content">
        <Header />

        <div
          style={{
            padding: "40px 32px",
            paddingTop: offset,
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "28px",
              color: "#111",
            }}
          >
            Términos y Condiciones
          </h1>

          <div
            style={{
              fontSize: "17.5px",
              lineHeight: 1.8,
              color: "#222",
            }}
          >
            <p>
              
            </p>

            <h2>1. Introducción</h2>
            <p>
              Estos Términos y Condiciones regulan el uso de la plataforma (en
              adelante, “la Plataforma”). Al acceder, navegar o utilizar la
              Plataforma, el usuario acepta quedar obligado por estos Términos.
            </p>
            <p>
              Si el usuario no está de acuerdo con alguno de ellos, deberá
              abstenerse de utilizar la Plataforma.
            </p>

            <h2>2. Naturaleza de la Plataforma</h2>
            <p>
              La Plataforma funciona únicamente como un espacio de publicación,
              visibilidad y contacto entre personas que ofrecen servicios y/o
              productos y personas interesadas en contratarlos.
            </p>
            <p>
              La Plataforma no actúa como proveedor de servicios, no es parte de
              los acuerdos que se celebren entre usuarios y no interviene en
              negociaciones, pagos, contratos ni ejecuciones de trabajos.
            </p>

            <h2>3. No verificación de profesionales</h2>
            <p>
              La Plataforma no verifica, certifica ni garantiza la identidad,
              idoneidad profesional, experiencia, habilitación legal ni la
              calidad de los servicios o productos ofrecidos por los usuarios.
            </p>
            <p>
              Cada usuario es responsable de evaluar, verificar y decidir con
              quién contratar.
            </p>

            <h2>4. Responsabilidad de los usuarios</h2>
            <p>
              Cada usuario es exclusivamente responsable de la información que
              publica, de la veracidad de los datos proporcionados, de los
              servicios o productos que ofrece y de los acuerdos que celebre con
              otros usuarios.
            </p>

            <h2>5. Contacto entre usuarios</h2>
            <p>
              El contacto entre usuarios se realiza por medios externos (por
              ejemplo, WhatsApp u otros canales). La Plataforma no participa ni
              interviene en acuerdos comerciales, pagos, entregas, ejecuciones de
              trabajos ni en conflictos entre usuarios.
            </p>

            <h2>6. Contenido y moderación</h2>
            <p>
              La Plataforma se reserva el derecho de moderar contenidos,
              eliminar perfiles o publicaciones y suspender o bloquear usuarios
              cuando lo considere necesario, sin previo aviso.
            </p>

            <h2>7. Uso prohibido</h2>
            <p>
              Queda prohibido utilizar la Plataforma para actividades ilegales,
              fraudes, estafas, suplantación de identidad o publicación de
              contenido falso, ofensivo o engañoso.
            </p>

            <h2>8. Condiciones especiales para usuarios profesionales</h2>

            <h3>8.1 Responsabilidad del profesional</h3>
            <p>
              El usuario profesional es el único responsable de la información
              publicada en su perfil, del cumplimiento de normativas legales,
              fiscales y profesionales aplicables, y de la correcta prestación
              de los servicios o entrega de los productos ofrecidos.
            </p>

            <h3>8.2 Uso de herramientas de la Plataforma</h3>
            <p>
              La Plataforma podrá ofrecer herramientas, asistentes o servicios
              para facilitar la visibilidad y gestión de perfiles profesionales.
              El uso de dichas herramientas no garantiza resultados,
              contrataciones ni ingresos.
            </p>

            <h3>8.3 Relación con la Plataforma</h3>
            <p>
              El uso de la Plataforma no implica relación laboral, comercial,
              societaria ni de dependencia entre la Plataforma y el usuario
              profesional, quien actúa de manera independiente.
            </p>

            <h3>8.4 Relación con clientes</h3>
            <p>
              El usuario profesional es el único responsable de la relación con
              sus clientes, incluyendo acuerdos, precios, cumplimiento y
              reclamos. La Plataforma no interviene ni responde por dichas
              relaciones.
            </p>

            <h3>8.5 Suspensión o baja</h3>
            <p>
              La Plataforma podrá suspender o eliminar perfiles profesionales
              ante denuncias, incumplimientos de estos Términos o uso indebido de
              la Plataforma, sin derecho a indemnización.
            </p>

            <h2>9. Limitación de responsabilidad</h2>
            <p>
              La Plataforma no será responsable por daños, pérdidas económicas,
              incumplimientos contractuales, conflictos entre usuarios ni por
              resultados derivados de servicios o productos contratados.
            </p>

            <h2>10. Modificaciones</h2>
            <p>
              La Plataforma podrá modificar estos Términos en cualquier momento.
              Las modificaciones entrarán en vigencia desde su publicación.
            </p>

            <h2>11. Jurisdicción y ley aplicable</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Argentina.
              Cualquier controversia será sometida a los tribunales competentes
              de dicha jurisdicción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
