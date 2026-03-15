import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useToast } from "../components/ToastHost.jsx";
import { useUsers } from "../context/UsersContext.jsx";

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() || "")
    .join("");
}

function UsersList({ users, onOpen }) {
  return (
    <div className="card list">
      {users.length === 0 ? (
        <div className="cardPad" style={{ opacity: 0.7 }}>Nieko nerasta.</div>
      ) : (
        users.map((u) => (
          <div key={u.id} className="row row--accent" onClick={() => onOpen(u.id)}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="avatar">
                {getInitials(u.name)}
                <span className="avatar__dot"></span>
              </div>

              <div>
                <div className="rowTitle">{u.name}</div>
                <div className="rowMeta">{u.email}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="pill"
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  textDecoration: "none",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={u.company?.name}
              >
                {u.company?.name}
              </span>
              <span style={{ color: "var(--muted)" }}>→</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddUserForm({ onAdd }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [catchPhrase, setCatchPhrase] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [suite, setSuite] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    const n = name.trim();
    const un = username.trim();
    const em = email.trim();
    const ph = phone.trim();
    const web = website.trim();
    const cn = companyName.trim();
    const cp = catchPhrase.trim();
    const ci = city.trim();
    const st = street.trim();
    const su = suite.trim();

    if (!n) return setError("Vardas privalomas.");
    if (!em) return setError("Email privalomas.");
    if (!cn) return setError("Company privaloma.");

    onAdd({
      name: n,
      username: un || "—",
      email: em,
      phone: ph || "—",
      website: web || "—",
      company: {
        name: cn,
        catchPhrase: cp || "—",
      },
      address: {
        city: ci || "—",
        street: st || "—",
        suite: su || "—",
      },
    });

    setName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setCompanyName("");
    setCatchPhrase("");
    setCity("");
    setStreet("");
    setSuite("");
  }

  return (
    <div className="card cardPad">
      <div className="cardTitle">Add user</div>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
        <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
        <input className="input" value={catchPhrase} onChange={(e) => setCatchPhrase(e.target.value)} placeholder="Catch phrase" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street" />
          <input className="input" value={suite} onChange={(e) => setSuite(e.target.value)} placeholder="Suite" />
        </div>

        {error ? <div style={{ color: "#b42318" }}>{error}</div> : null}

        <button className="btn btnPrimary" type="submit">Add user</button>
      </form>
    </div>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { users, addUser, resetUsers } = useUsers();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | name-asc | name-desc | company-asc | company-desc

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? users
      : users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.company?.name?.toLowerCase().includes(q)
        );

    const sorted = [...base];

    if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "company-asc") {
      sorted.sort((a, b) => (a.company?.name || "").localeCompare(b.company?.name || ""));
    } else if (sortBy === "company-desc") {
      sorted.sort((a, b) => (b.company?.name || "").localeCompare(a.company?.name || ""));
    } else {
      sorted.sort((a, b) => b.id - a.id); // newest
    }

    return sorted;
  }, [users, query, sortBy]);

  function handleAdd(payload) {
    const newId = addUser(payload);
    toast.show(`Pridėtas user: ${payload.name}`);
    setQuery("");
    setSortBy("newest");
    navigate(`/users/${newId}`);
  }

  function handleReset() {
    if (confirm("Atstatyti pradinius users duomenis?")) {
      resetUsers();
      setQuery("");
      setSortBy("newest");
      toast.show("Users atstatyti");
    }
  }

  return (
    <div className="container">
      <Header title="Users" subtitle="Local users • Add • Search • Sort • Details • localStorage" />

      <div className="grid2">
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card cardPad">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <SearchBox
                  query={query}
                  onQueryChange={setQuery}
                  placeholder="Paieška… (vardas, email, įmonė)"
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
                <option value="company-asc">Company A–Z</option>
                <option value="company-desc">Company Z–A</option>
              </select>

              <button className="btn" onClick={handleReset}>Reset</button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)" }}>
              Rodoma: <b style={{ color: "var(--text)" }}>{filtered.length}</b> iš{" "}
              <b style={{ color: "var(--text)" }}>{users.length}</b>
            </div>
          </div>

          <UsersList users={filtered} onOpen={(id) => navigate(`/users/${id}`)} />
        </div>

        <AddUserForm onAdd={handleAdd} />
      </div>
    </div>
  );
}
