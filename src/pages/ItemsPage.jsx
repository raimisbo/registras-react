import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "../context/ItemsContext.jsx";
import Header from "../components/Header.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useToast } from "../components/ToastHost.jsx";

function ItemsList({ items, onOpen, onDelete }) {
  return (
    <div className="card list">
      {items.length === 0 ? (
        <div className="cardPad" style={{ opacity: 0.7 }}>Nieko nerasta.</div>
      ) : (
        items.map((it) => (
          <div key={it.id} className="row row--accent" onClick={() => onOpen(it.id)}>
            <div>
              <div className="rowTitle">{it.name}</div>
              <div className="rowMeta">
                {it.category} • €{it.price} • stock: {it.stock}
              </div>
            </div>

            <button
              className="btn btnDanger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(it.id);
              }}
              title="Ištrinti"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    const n = name.trim();
    const c = category.trim();
    const p = Number(price);
    const s = Number(stock);

    if (!n) return setError("Pavadinimas privalomas.");
    if (!c) return setError("Kategorija privaloma.");
    if (!Number.isFinite(p) || p < 0) return setError("Kaina turi būti skaičius >= 0.");
    if (!Number.isFinite(s) || s < 0) return setError("Stock turi būti skaičius >= 0.");

    onAdd({
      name: n,
      category: c,
      price: Math.round(p * 100) / 100,
      stock: Math.floor(s),
      note: note.trim() || "—",
    });

    setName("");
    setCategory("");
    setPrice("0");
    setStock("0");
    setNote("");
  }

  return (
    <div className="card cardPad">
      <div className="cardTitle">Add item</div>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pavadinimas" />
        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategorija" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Kaina" inputMode="decimal" />
          <input className="input" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" inputMode="numeric" />
        </div>

        <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pastaba (nebūtina)" rows={3} />

        {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

        <button className="btn btnPrimary" type="submit">Add</button>
      </form>
    </div>
  );
}

export default function ItemsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, addItem, deleteItem, resetItems } = useItems();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | name-asc | name-desc | price-asc | price-desc

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? items
      : items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)
        );

    const sorted = [...base];

    if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort((a, b) => b.id - a.id); // newest
    }

    return sorted;
  }, [items, query, sortBy]);

  function handleAdd(payload) {
    const newId = addItem(payload);
    toast.show(`Pridėta: ${payload.name}`);
    setQuery("");
    setSortBy("newest");
    navigate(`/items/${newId}`);
  }

  function handleDelete(id) {
    const found = items.find((x) => x.id === id);
    deleteItem(id);
    toast.show(found ? `Ištrinta: ${found.name}` : "Ištrinta");
  }

  function handleReset() {
    if (confirm("Atstatyti pradinius duomenis? (ištrins visus tavo įrašus)")) {
      resetItems();
      setQuery("");
      setSortBy("newest");
      toast.show("Atstatyti pradiniai duomenys");
    }
  }

  return (
    <div className="container">
      <Header
        title="Items"
        subtitle="Create • Update • Delete • Sort • localStorage • Apple-ish UI"
      />

      <div className="grid2">
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card cardPad">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <SearchBox
                  query={query}
                  onQueryChange={setQuery}
                  placeholder="Paieška… (pavadinimas / kategorija)"
                />
              </div>

              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 190 }}
              >
                <option value="newest">Newest</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="price-asc">Price low–high</option>
                <option value="price-desc">Price high–low</option>
              </select>

              <button className="btn" onClick={handleReset}>Reset</button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)" }}>
              Rodoma: <b>{filtered.length}</b> iš <b>{items.length}</b>
            </div>
          </div>

          <ItemsList
            items={filtered}
            onOpen={(id) => navigate(`/items/${id}`)}
            onDelete={handleDelete}
          />
        </div>

        <AddItemForm onAdd={handleAdd} />
      </div>
    </div>
  );
}
