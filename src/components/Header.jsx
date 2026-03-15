export default function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 className="h1">{title}</h1>
      {subtitle ? <div className="sub">{subtitle}</div> : null}
    </div>
  );
}
