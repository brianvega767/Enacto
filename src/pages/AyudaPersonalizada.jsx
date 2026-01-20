import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

function AyudaPersonalizada() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const MAX_CHARS = 300;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!nombre || !email || !mensaje) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoading(true);

    // ✅ ENVÍO REAL A SUPABASE
    const { error } = await supabase
      .from("help_requests")
      .insert([
        {
          name: nombre,
          email: email,
          message: mensaje,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error("Error al enviar ayuda:", error);
      alert("No se pudo enviar el mensaje. Intentá nuevamente.");
      return;
    }

    // ✅ ÉXITO REAL
    setShowSuccess(true);
    setNombre("");
    setEmail("");
    setMensaje("");
  };

  return (
    <>
      {/* TOAST ERROR */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "0.9rem 1.6rem",
            borderRadius: "999px",
            fontSize: "0.95rem",
            boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          Completá todos los campos antes de enviar
        </div>
      )}

      <div className="account-overlay-light">
        <div
          className="account-panel"
          style={{
            maxWidth: "620px",
            padding: "2.8rem",
            borderRadius: "16px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          }}
        >
          <h1 className="account-title">Ayuda personalizada</h1>

          <p
            style={{
              marginBottom: "2rem",
              color: "#555",
              fontSize: "1.1rem",
              lineHeight: "1.6",
            }}
          >
            Contanos qué problema estás teniendo y lo vamos a revisar.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
            }}
          >
            <div>
              <label style={labelStyle}>Tu nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Tu email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Mensaje</label>
              <textarea
                rows={5}
                value={mensaje}
                onChange={(e) =>
                  setMensaje(e.target.value.slice(0, MAX_CHARS))
                }
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.85rem",
                  color: "#777",
                  marginTop: "4px",
                }}
              >
                {mensaje.length} / {MAX_CHARS}
              </div>
            </div>

            <button
              type="submit"
              className="account-btn"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL ÉXITO */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "2.5rem",
              maxWidth: "520px",
              textAlign: "center",
              boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "1.7rem",
                color: "#222",
                fontWeight: "600",
              }}
            >
              ¡Mensaje enviado!
            </h2>

            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.6",
                color: "#333",
              }}
            >
              Recibimos tu mensaje correctamente 🙌  
              Vamos a revisarlo y responderte lo antes posible.
            </p>

            <button
              className="account-btn"
              style={{ marginTop: "2rem" }}
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* estilos locales */
const inputStyle = {
  width: "100%",
  padding: "0.95rem",
  fontSize: "1rem",
  borderRadius: "10px",
  border: "1px solid #d0d0d0",
};

const labelStyle = {
  marginBottom: "0.4rem",
  display: "block",
  fontSize: "0.95rem",
  color: "#444",
};

export default AyudaPersonalizada;
