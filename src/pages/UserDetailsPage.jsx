import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Field from "../components/Field.jsx";
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

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { users, updateUser, deleteUser } = useUsers();

  const userId = Number(id);
  const user = users.find((u) => u.id === userId) || null;

  const [editing, setEditing] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setWebsite(user.website ?? "");
    setCompanyName(user.company?.name ?? "");
    setCatchPhrase(user.company?.catchPhrase ?? "");
    setCity(user.address?.city ?? "");
    setStreet(user.address?.street ?? "");
    setSuite(user.address?.suite ?? "");
    setError("");
  }, [userId, user]);

  function startEdit() {
    if (!user) return;
    setEditing(true);
  }

  function cancelEdit() {
    if (!user) return;
    setName(user.name ?? "");
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setWebsite(user.website ?? "");
    setCompanyName(user.company?.name ?? "");
    setCatchPhrase(user.company?.catchPhrase ?? "");
    setCity(user.address?.city ?? "");
    setStreet(user.address?.street ?? "");
    setSuite(user.address?.suite ?? "");
    setError("");
    setEditing(false);
  }

  function save() {
    if (!user) return;
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

    updateUser(userId, {
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

    toast.show(`Išsaugota: ${n}`);
    setEditing(false);
  }

  function confirmDelete() {
    if (!user) return;
    if (!confirm(`Ištrinti "${user.name}"?`)) return;

    deleteUser(userId);
    toast.show(`Ištrinta: ${user.name}`);
    navigate("/users");
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Link className="pill" to="/users">← Users</Link>

        {user && !editing ? (
          <button className="btn btnDanger" onClick={confirmDelete}>Delete</button>
        ) : null}
      </div>

      {!user ? (
        <div className="card cardPad">
          <div style={{ fontWeight: 800, marginBottom: 6, color: "#b42318" }}>
            User nerastas
          </div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>ID: {id}</div>
          <Link className="pill" to="/users">Grįžti į sąrašą</Link>
        </div>
      ) : (
        <div className="card cardPad">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="avatar">
                {getInitials(user.name)}
                <span className="avatar__dot"></span>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  User #{user.id}
                </div>
                <h1 className="h1" style={{ fontSize: 34, marginBottom: 8 }}>
                  {user.name}
                </h1>
                <div className="sub" style={{ marginTop: 0 }}>{user.email}</div>
              </div>
            </div>

            {!editing ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" }}>
                <span className="pill" title={user.company?.name}>{user.company?.name}</span>
                <a className="pill" href={`mailto:${user.email}`}>Email</a>
                <button className="btn" onClick={startEdit}>Edit</button>
              </div>
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
                  <div className="cardTitle">Contact</div>
                  <div style={{ display: "grid", gap: 8, color: "var(--muted)" }}>
                    <div>
                      Phone: <b style={{ color: "var(--text)" }}>{user.phone}</b>
                    </div>
                    <div>
                      Website: <b style={{ color: "var(--text)" }}>{user.website}</b>
                    </div>
                    <div>
                      Username: <b style={{ color: "var(--text)" }}>{user.username}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                <div className="cardPad">
                  <div className="cardTitle">Company & Address</div>
                  <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, color: "var(--text)" }}>{user.company?.name}</div>
                    <div>{user.company?.catchPhrase}</div>
                    <div style={{ marginTop: 8 }}>
                      Address:{" "}
                      <b style={{ color: "var(--text)" }}>
                        {user.address?.city || "—"}, {user.address?.street || "—"}
                      </b>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      Suite: <b style={{ color: "var(--text)" }}>{user.address?.suite || "—"}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Name">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field label="Username">
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
              </Field>

              <Field label="Email">
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Phone">
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>

                <Field label="Website">
                  <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </Field>
              </div>

              <Field label="Company name">
                <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>

              <Field label="Catch phrase">
                <input className="input" value={catchPhrase} onChange={(e) => setCatchPhrase(e.target.value)} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="City">
                  <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>

                <Field label="Street">
                  <input className="input" value={street} onChange={(e) => setStreet(e.target.value)} />
                </Field>

                <Field label="Suite">
                  <input className="input" value={suite} onChange={(e) => setSuite(e.target.value)} />
                </Field>
              </div>

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
