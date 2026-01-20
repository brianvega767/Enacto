import { useNavigate } from "react-router-dom";
import "../App.css";

function Ayuda() {
  const navigate = useNavigate();

  return (
    <div className="account-overlay-light">
      <div
        className="account-panel"
        style={{
          maxWidth: "600px",
          padding: "2.5rem",
        }}
      >
        <h1 className="account-title">Ayuda</h1>

        <p
          style={{
            marginBottom: "2rem",
            color: "#555",
            fontSize: "1.1rem",
            lineHeight: "1.5",
          }}
        >
          Elegí una opción para resolver tu problema o
          contactarnos directamente.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          {/* =====================
              CAMBIO DE EMAIL
             ===================== */}
          <button
            className="account-btn"
            style={cardButtonStyle}
            onClick={() =>
              navigate("/recuperar-email")
            }
          >
            <div style={cardTitleStyle}>
              Solicitar cambio de email
            </div>
            <div style={cardTextStyle}>
              Si ya no tenés acceso a tu correo actual,
              podés solicitar un cambio manual.
            </div>
          </button>

          {/* =====================
              OLVIDÉ MI CONTRASEÑA
             ===================== */}
          <button
            className="account-btn"
            style={cardButtonStyle}
            onClick={() =>
              navigate("/recuperar-password")
            }
          >
            <div style={cardTitleStyle}>
              Olvidé mi contraseña
            </div>
            <div style={cardTextStyle}>
              Enviarte un enlace para crear una nueva
              contraseña.
            </div>
          </button>

          {/* =====================
              AYUDA PERSONALIZADA
             ===================== */}
          <button
            className="account-btn"
            style={cardButtonStyle}
            onClick={() =>
              navigate("/ayuda/personalizada")
            }
          >
            <div style={cardTitleStyle}>
              Ayuda personalizada
            </div>
            <div style={cardTextStyle}>
              Contanos tu problema y te responderemos
              lo antes posible.
            </div>
          </button>
        </div>

        <button
          className="account-btn secondary"
          style={{ marginTop: "2rem" }}
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    </div>
  );
}

/* =======================
   🎨 Estilos locales
   ======================= */

const cardButtonStyle = {
  textAlign: "left",
  padding: "1.4rem",
  borderRadius: "12px",
  cursor: "pointer",
};

const cardTitleStyle = {
  fontSize: "1.15rem",
  fontWeight: "600",
  marginBottom: "0.3rem",
};

const cardTextStyle = {
  fontSize: "0.95rem",
  color: "#555",
};

export default Ayuda;
