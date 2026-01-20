import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function CookiesPage() {
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
            Política de Cookies
          </h1>

          <div
            style={{
              fontSize: "17.5px",
              lineHeight: 1.8,
              color: "#222",
            }}
          >
            <p>
              La presente Política de Cookies explica qué son las cookies y cómo
              se utilizan en la Plataforma.
            </p>

            <h2>1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos que se almacenan en el
              dispositivo del usuario cuando navega por un sitio web. Su función
              principal es permitir una mejor experiencia de navegación y
              recordar determinadas preferencias.
            </p>

            <h2>2. Cookies utilizadas por la Plataforma</h2>
            <p>
              La Plataforma utiliza únicamente cookies propias con fines
              funcionales y de experiencia de usuario, tales como:
            </p>
            <ul>
              <li>recordar la aceptación del uso de cookies</li>
              <li>mejorar la navegación y el funcionamiento general</li>
            </ul>
            <p>
              Actualmente, la Plataforma no utiliza cookies con fines
              publicitarios ni cookies de seguimiento de terceros.
            </p>

            <h2>3. Consentimiento</h2>
            <p>
              Al acceder a la Plataforma, se muestra un aviso informando sobre el
              uso de cookies. El usuario puede aceptar su uso mediante el botón
              correspondiente. Una vez aceptadas, la preferencia queda
              almacenada.
            </p>

            <h2>4. Cómo desactivar las cookies</h2>
            <p>
              El usuario puede configurar su navegador para rechazar o eliminar
              cookies en cualquier momento. Sin embargo, esto podría afectar el
              correcto funcionamiento de algunas partes de la Plataforma.
            </p>

            <h2>5. Modificaciones</h2>
            <p>
              La Plataforma podrá actualizar esta Política de Cookies en
              cualquier momento. Las modificaciones entrarán en vigencia desde
              su publicación en la Plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookiesPage;
