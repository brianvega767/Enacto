import { createPortal } from "react-dom";
import { useEffect } from "react";

function LegalModal({
  open,
  title = "Aviso",
  content,
  confirmText = "Aceptar",
  onConfirm,
  onCancel,
}) {
  // 🔥 Blur global
  useEffect(() => {
    if (open) {
      document.body.classList.add("legal-modal-open");
    } else {
      document.body.classList.remove("legal-modal-open");
    }

    return () => {
      document.body.classList.remove("legal-modal-open");
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          maxWidth: "520px",
          width: "100%",
          color: "#111",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* TÍTULO */}
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "21px",
            fontWeight: 700,
            color: "#111",
          }}
        >
          {title}
        </h2>

        {/* CONTENIDO */}
        <div
          style={{
            fontSize: "16px",
            lineHeight: 1.7,
            color: "#333",
            marginBottom: "24px",
          }}
        >
          {content}
        </div>

        {/* ACCIONES */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#f9f9f9",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#000",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default LegalModal;
