import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function PrivacyPage() {
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
            Política de Privacidad
          </h1>

          <div
            style={{
              fontSize: "17.5px",
              lineHeight: 1.8,
              color: "#222",
            }}
          >
            <p>
              La presente Política de Privacidad describe cómo la Plataforma
              recopila, utiliza y protege los datos personales de los usuarios.
            </p>

            <h2>1. Datos recopilados</h2>
            <p>La Plataforma puede recopilar los siguientes datos personales:</p>
            <ul>
              <li>nombre y apellido o nombre comercial</li>
              <li>dirección de correo electrónico</li>
              <li>información de contacto proporcionada por el usuario</li>
              <li>datos necesarios para la creación y gestión de perfiles</li>
            </ul>
            <p>La Plataforma no solicita ni almacena datos sensibles.</p>

            <h2>2. Uso de la información</h2>
            <p>
              Los datos personales recopilados se utilizan exclusivamente para:
            </p>
            <ul>
              <li>permitir el funcionamiento de la Plataforma</li>
              <li>gestionar perfiles de usuarios</li>
              <li>facilitar el contacto entre usuarios</li>
              <li>mejorar la experiencia de uso</li>
            </ul>
            <p>
              La información no se utiliza con fines publicitarios sin
              consentimiento del usuario.
            </p>

            <h2>3. Compartición de datos</h2>
            <p>
              La Plataforma no vende ni cede datos personales a terceros. Los
              datos solo podrán ser compartidos cuando sea necesario para el
              funcionamiento del servicio o cuando exista una obligación legal.
            </p>

            <h2>4. Seguridad</h2>
            <p>
              La Plataforma adopta medidas razonables para proteger los datos
              personales de accesos no autorizados, pérdidas o usos indebidos.
              No obstante, el usuario reconoce que ningún sistema es
              completamente seguro.
            </p>

            <h2>5. Responsabilidad del usuario</h2>
            <p>
              El usuario es responsable de la veracidad y actualización de los
              datos personales proporcionados, así como del uso que haga de los
              datos de contacto obtenidos a través de la Plataforma.
            </p>

            <h2>6. Derechos del usuario</h2>
            <p>
              El usuario podrá solicitar la actualización o eliminación de sus
              datos personales conforme a la normativa vigente, a través de los
              medios de contacto de la Plataforma.
            </p>

            <h2>7. Modificaciones</h2>
            <p>
              La Plataforma podrá modificar esta Política de Privacidad en
              cualquier momento. Las modificaciones entrarán en vigencia desde
              su publicación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
