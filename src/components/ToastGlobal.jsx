import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className={`toast-global toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "⚠"}
            {toast.type === "info" && "ℹ"}
          </span>

          <span className="toast-message">
            {toast.message}
          </span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}
