import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookiesAccepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#1f2933",
        color: "#f9fafb",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* TEXTO */}
        <div
          style={{
            fontSize: "14.5px",
            lineHeight: 1.6,
            maxWidth: "900px",
          }}
        >
          Utilizamos cookies propias para mejorar la experiencia de navegación.
          Al continuar navegando, aceptás su uso. Podés obtener más información
          en nuestra{" "}
          <Link
            to="/cookies"
            style={{
              color: "#93c5fd",
              textDecoration: "underline",
            }}
          >
            Política de Cookies
          </Link>
          .
        </div>

        {/* BOTÓN */}
        <button
          onClick={acceptCookies}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14.5px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
