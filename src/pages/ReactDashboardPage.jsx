import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="card cardPad">
      <div className="cardTitle">{title}</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  );
}

export default function ReactDashboardPage() {
  const [rows, setRows] = useState([]);
  const [rowsError, setRowsError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/pozicijos/api/preview/")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setRows(data);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedId(data[0].id);
        }
      })
      .catch((e) => setRowsError(String(e)));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    setDetailError("");

    fetch(`http://127.0.0.1:8000/pozicijos/api/${selectedId}/`)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setDetail(data);
        setDetailLoading(false);
      })
      .catch((e) => {
        setDetailError(String(e));
        setDetailLoading(false);
      });
  }, [selectedId]);

  const totalRows = rows.length;

  const coloredCount = useMemo(
    () => rows.filter((r) => r.spalva && String(r.spalva).trim()).length,
    [rows]
  );

  return (
    <div className="container">
      <Header
        title="Registras Dashboard"
        subtitle="React dashboard prototipas, kuris ima realius duomenis iš Django API"
      />

      <div className="grid2" style={{ marginBottom: 14 }}>
        <StatCard
          title="Pozicijos preview"
          value={totalRows}
          subtitle="Paskutinės pozicijos iš Django preview endpointo"
        />
        <StatCard
          title="Su spalva"
          value={coloredCount}
          subtitle="Kiek preview pozicijų turi užpildytą spalvą"
        />
      </div>

      {rowsError ? (
        <div className="card cardPad" style={{ color: "#b42318" }}>
          Sąrašo klaida: {rowsError}
        </div>
      ) : (
        <div className="grid2" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
          <div className="card list">
            {rows.length === 0 ? (
              <div className="cardPad" style={{ color: "var(--muted)" }}>
                Krauna sąrašą...
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="row row--accent"
                  onClick={() => setSelectedId(row.id)}
                  style={{
                    background:
                      selectedId === row.id
                        ? "rgba(0,113,227,0.10)"
                        : undefined,
                  }}
                >
                  <div>
                    <div className="rowTitle">
                      {row.projektas || "—"}{" "}
                      <span style={{ color: "var(--muted)" }}>#{row.id}</span>
                    </div>

                    <div className="rowMeta">
                      Klientas: {row.klientas || "—"} • Metalas: {row.metalas || "—"}
                    </div>

                    <div className="rowMeta" style={{ marginTop: 4 }}>
                      Padengimas: {row.padengimas || "—"} • Spalva: {row.spalva || "—"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card cardPad">
            {!selectedId ? (
              <div style={{ color: "var(--muted)" }}>Pasirink poziciją iš sąrašo.</div>
            ) : detailLoading ? (
              <div style={{ color: "var(--muted)" }}>Krauna detales...</div>
            ) : detailError ? (
              <div style={{ color: "#b42318" }}>Detalės klaida: {detailError}</div>
            ) : detail ? (
              <>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Pozicija #{detail.id}
                </div>

                <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 30, letterSpacing: "-0.02em" }}>
                  {detail.projektas || "—"}
                </h2>

                <div style={{ color: "var(--muted)", marginBottom: 14 }}>
                  Klientas: <b style={{ color: "var(--text)" }}>{detail.klientas || "—"}</b>
                </div>

                <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                    <div className="cardPad">
                      <div className="cardTitle">Techninė info</div>
                      <div style={{ display: "grid", gap: 8, color: "var(--muted)" }}>
                        <div>Metalas: <b style={{ color: "var(--text)" }}>{detail.metalas || "—"}</b></div>
                        <div>Paruošimas: <b style={{ color: "var(--text)" }}>{detail.paruosimas || "—"}</b></div>
                        <div>Padengimas: <b style={{ color: "var(--text)" }}>{detail.padengimas || "—"}</b></div>
                        <div>Spalva: <b style={{ color: "var(--text)" }}>{detail.spalva || "—"}</b></div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                    <div className="cardPad">
                      <div className="cardTitle">Papildoma</div>
                      <div style={{ display: "grid", gap: 8, color: "var(--muted)" }}>
                        <div>Kiekis: <b style={{ color: "var(--text)" }}>{detail.kiekis ?? "—"}</b></div>
                        <div>Mato vnt: <b style={{ color: "var(--text)" }}>{detail.mato_vnt || "—"}</b></div>
                        <div>Pastabos: <b style={{ color: "var(--text)" }}>{detail.pastabos || "—"}</b></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--muted)" }}>Nėra detalių.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
