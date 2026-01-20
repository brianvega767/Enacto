import { Link } from "react-router-dom";

function LegalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#f5f6f8",
        marginTop: "48px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* IZQUIERDA */}
        <div
          style={{
            fontSize: "14.5px",
            color: "#555",
          }}
        >
          © {year} ENACTO. Todos los derechos reservados.
        </div>

        {/* LINKS LEGALES */}
        <nav
          aria-label="Enlaces legales"
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/terms"
            style={{
              fontSize: "14.5px",
              color: "#555",
              textDecoration: "none",
            }}
          >
            Términos y Condiciones
          </Link>

          <Link
            to="/privacy"
            style={{
              fontSize: "14.5px",
              color: "#555",
              textDecoration: "none",
            }}
          >
            Política de Privacidad
          </Link>

          <Link
            to="/cookies"
            style={{
              fontSize: "14.5px",
              color: "#555",
              textDecoration: "none",
            }}
          >
            Cookies
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default LegalFooter;
