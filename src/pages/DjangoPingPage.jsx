import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";

export default function DjangoPingPage() {
  const [rows, setRows] = useState([]);
  const [rowsError, setRowsError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // 1) užkraunam preview sąrašą
  useEffect(() => {
    fetch("http://127.0.0.1:8000/pozicijos/api/preview/")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setRows(data);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedId(data[0].id); // automatiškai parenkam pirmą
        }
      })
      .catch((e) => setRowsError(String(e)));
  }, []);

  // 2) kai selectedId pasikeičia, užkraunam detalę
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

  return (
    <div className="container">
      <Header
        title="Django Pozicijos master-detail"
        subtitle="React rodo realų sąrašą iš Django ir atskirai krauna pasirinktos pozicijos detales"
      />

      {rowsError ? (
        <div className="card cardPad" style={{ color: "#b42318" }}>
          Sąrašo klaida: {rowsError}
        </div>
      ) : (
        <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* KAIRĖ: master list */}
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
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DEŠINĖ: detail */}
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
                        <div>
                          Metalas: <b style={{ color: "var(--text)" }}>{detail.metalas || "—"}</b>
                        </div>
                        <div>
                          Paruošimas: <b style={{ color: "var(--text)" }}>{detail.paruosimas || "—"}</b>
                        </div>
                        <div>
                          Padengimas: <b style={{ color: "var(--text)" }}>{detail.padengimas || "—"}</b>
                        </div>
                        <div>
                          Spalva: <b style={{ color: "var(--text)" }}>{detail.spalva || "—"}</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: "rgba(255,255,255,0.55)" }}>
                    <div className="cardPad">
                      <div className="cardTitle">Papildoma</div>
                      <div style={{ display: "grid", gap: 8, color: "var(--muted)" }}>
                        <div>
                          Kiekis: <b style={{ color: "var(--text)" }}>{detail.kiekis ?? "—"}</b>
                        </div>
                        <div>
                          Mato vnt: <b style={{ color: "var(--text)" }}>{detail.mato_vnt || "—"}</b>
                        </div>
                        <div>
                          Pastabos: <b style={{ color: "var(--text)" }}>{detail.pastabos || "—"}</b>
                        </div>
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
