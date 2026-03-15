import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function show(message, opts = {}) {
    const id = Date.now() + Math.random();
    const timeoutMs = opts.timeoutMs ?? 2200;

    const toast = { id, message };
    setToasts((prev) => [...prev, toast]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeoutMs);
  }

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "grid",
          gap: 8,
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "10px 12px",
              background: "white",
              boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
              maxWidth: 360,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() turi būti naudojamas ToastProvider viduje");
  return ctx;
}
