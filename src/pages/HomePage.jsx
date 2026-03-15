import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "../context/ItemsContext.jsx";
import { useUsers } from "../context/UsersContext.jsx";

function StatCard({ title, value, subtitle, onClick, actionLabel }) {
  return (
    <div className="card cardPad" style={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div className="cardTitle">{title}</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>{subtitle}</div>
      {actionLabel ? (
        <div style={{ marginTop: 12 }}>
          <span className="pill">{actionLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

function MiniList({ title, items, emptyText, renderRow }) {
  return (
    <div className="card cardPad">
      <div className="cardTitle">{title}</div>

      {items.length === 0 ? (
        <div style={{ color: "var(--muted)" }}>{emptyText}</div>
      ) : (
        <div className="list" style={{ borderRadius: 14, border: "1px solid var(--border)" }}>
          {items.map(renderRow)}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { items } = useItems();
  const { users } = useUsers();

  const latestItems = useMemo(() => [...items].sort((a, b) => b.id - a.id).slice(0, 5), [items]);
  const latestUsers = useMemo(() => [...users].sort((a, b) => b.id - a.id).slice(0, 5), [users]);

  const totalStock = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
    [items]
  );

  const avgPrice = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    return Math.round((total / items.length) * 100) / 100;
  }, [items]);

  return (
    <div className="container">
      <div className="card cardPad" style={{ padding: 26 }}>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
          Dashboard
        </div>

        <h1 className="h1" style={{ marginBottom: 10 }}>
          Overview
        </h1>

        <div className="sub" style={{ maxWidth: 760 }}>
          Vienoje vietoje matai Items ir Users suvestinę, paskutinius įrašus ir greitą navigaciją.
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btnPrimary" onClick={() => navigate("/items")}>
            Open Items
          </button>
          <button className="btn" onClick={() => navigate("/users")}>
            Open Users
          </button>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <StatCard
          title="Items"
          value={items.length}
          subtitle={`Total stock: ${totalStock} • Avg price: €${avgPrice}`}
          onClick={() => navigate("/items")}
          actionLabel="Go to Items"
        />

        <StatCard
          title="Users"
          value={users.length}
          subtitle="Local users with CRUD, detail routes and localStorage"
          onClick={() => navigate("/users")}
          actionLabel="Go to Users"
        />
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <MiniList
          title="Latest Items"
          items={latestItems}
          emptyText="Nėra items."
          renderRow={(item) => (
            <div
              key={item.id}
              className="row row--accent"
              onClick={() => navigate(`/items/${item.id}`)}
            >
              <div>
                <div className="rowTitle">{item.name}</div>
                <div className="rowMeta">
                  {item.category} • €{item.price} • stock: {item.stock}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </div>
          )}
        />

        <MiniList
          title="Latest Users"
          items={latestUsers}
          emptyText="Nėra users."
          renderRow={(user) => (
            <div
              key={user.id}
              className="row row--accent"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <div>
                <div className="rowTitle">{user.name}</div>
                <div className="rowMeta">
                  {user.email} • {user.company?.name}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
