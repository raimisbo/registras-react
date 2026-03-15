import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useItems } from "../context/ItemsContext.jsx";
import Field from "../components/Field.jsx";
import { useToast } from "../components/ToastHost.jsx";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const itemId = Number(id);
  const { items, updateItem, deleteItem } = useItems();
  const item = items.find((x) => x.id === itemId) || null;

  const [editing, setEditing] = useState(false);

  // controlled form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!item) return;
    setName(item.name ?? "");
    setCategory(item.category ?? "");
    setPrice(String(item.price ?? 0));
    setStock(String(item.stock ?? 0));
    setNote(item.note ?? "");
    setError("");
  }, [itemId, item]);

  function startEdit() {
    if (!item) return;
    setEditing(true);
  }

  function cancelEdit() {
    if (!item) return;
    setName(item.name ?? "");
    setCategory(item.category ?? "");
    setPrice(String(item.price ?? 0));
    setStock(String(item.stock ?? 0));
    setNote(item.note ?? "");
    setError("");
    setEditing(false);
  }

  function save() {
    if (!item) return;
    setError("");

    const n = name.trim();
    const c = category.trim();
    const p = Number(price);
    const s = Number(stock);

    if (!n) return setError("Pavadinimas privalomas.");
    if (!c) return setError("Kategorija privaloma.");
    if (!Number.isFinite(p) || p < 0) return setError("Kaina turi būti skaičius >= 0.");
    if (!Number.isFinite(s) || s < 0) return setError("Stock turi būti skaičius >= 0.");

    updateItem(itemId, {
      name: n,
      category: c,
      price: Math.round(p * 100) / 100,
      stock: Math.floor(s),
      note: note.trim() || "—",
    });

    toast.show(`Išsaugota: ${n}`);
    setEditing(false);
  }

  function confirmDelete() {
    if (!item) return;
    if (!confirm(`Ištrinti "${item.name}"?`)) return;

    deleteItem(itemId);
    toast.show(`Ištrinta: ${item.name}`);
    navigate("/items");
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Link className="pill" to="/items">← Items</Link>

        {item && !editing ? (
          <button className="btn btnDanger" onClick={confirmDelete}>Delete</button>
        ) : null}
      </div>

      {!item ? (
        <div className="card cardPad">
          <div style={{ fontWeight: 800, marginBottom: 6, color: "#b42318" }}>
            Item nerastas (gal ištrintas)
          </div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>ID: {id}</div>
          <Link className="pill" to="/items">Grįžti į sąrašą</Link>
        </div>
      ) : (
        <div className="card cardPad">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Item #{item.id}
              </div>
              <h1 className="h1" style={{ fontSize: 34, marginBottom: 8 }}>{item.name}</h1>
              <div className="sub" style={{ marginTop: 0 }}>{item.category}</div>
            </div>

            {!editing ? (
              <button className="btn" onClick={startEdit}>Edit</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btnPrimary" onClick={save}>Save</button>
                <button className="btn" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </div>

          <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid rgba(0,0,0,0.08)" }} />

          {!editing ? (
            <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                <div className="cardPad">
                  <div className="cardTitle">Pricing</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                    €{item.price}
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>
                    Stock: <b style={{ color: "var(--text)" }}>{item.stock}</b>
                  </div>
                </div>
              </div>

              <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                <div className="cardPad">
                  <div className="cardTitle">Note</div>
                  <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>
                    {item.note}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Pavadinimas">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field label="Kategorija">
                <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Kaina">
                  <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
                </Field>

                <Field label="Stock">
                  <input className="input" value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" />
                </Field>
              </div>

              <Field label="Pastaba">
                <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
              </Field>

              {error ? (
                <div style={{ color: "#b42318", fontWeight: 600 }}>{error}</div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
