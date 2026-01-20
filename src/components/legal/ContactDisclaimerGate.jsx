import { useState } from "react";
import React from "react";
import LegalModal from "./LegalModal";

export default function ContactDisclaimerGate({
  whatsappUrl,
  children,
}) {
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleProceed = () => {
    setOpen(false);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (!React.isValidElement(children)) {
    console.error(
      "ContactDisclaimerGate necesita un elemento React como hijo"
    );
    return null;
  }

  const childWithHandler = React.cloneElement(children, {
    onClick: handleClick,
    type: "button", // 🔥 evita submits raros
  });

  return (
    <>
      {childWithHandler}

      <LegalModal
        open={open}
        title="Aviso"
        confirmText="Aceptar y continuar"
        onConfirm={handleProceed}
        onCancel={() => setOpen(false)}
        content={
          <>
            <p>
              La plataforma funciona únicamente como intermediaria y no verifica
              la identidad ni idoneidad de los usuarios.
            </p>
            <p>
              Los acuerdos y trabajos realizados son responsabilidad exclusiva
              entre las partes involucradas.
            </p>
            <a
              href="/terms"
              className="text-sm text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver términos y condiciones
            </a>
          </>
        }
      />
    </>
  );
}
