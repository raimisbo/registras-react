export default function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      {children}
    </div>
  );
}
