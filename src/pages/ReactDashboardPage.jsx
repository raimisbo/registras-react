import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useToast } from "../components/ToastHost.jsx";

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

const PAGE_SIZE = 8;

export default function ReactDashboardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const selectedId = id ? Number(id) : null;

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsError, setRowsError] = useState("");

  const [query, setQuery] = useState("");
  const [metalas, setMetalas] = useState("");
  const [padengimas, setPadengimas] = useState("");
  const [spalva, setSpalva] = useState("");
  const [sort, setSort] = useState("newest");
  const [offset, setOffset] = useState(0);

  const filtersKey = JSON.stringify({ query, metalas, padengimas, spalva });
  const prevFiltersKeyRef = useRef(filtersKey);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [listLoading, setListLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    metalai: [],
    padengimai: [],
    spalvos: [],
  });
  const [filterOptionsError, setFilterOptionsError] = useState("");

  const loadSummary = useCallback((params) => {
    const url = new URL("http://127.0.0.1:8000/pozicijos/api/summary/");

    if (params.query.trim()) url.searchParams.set("q", params.query.trim());
    if (params.metalas.trim()) url.searchParams.set("metalas", params.metalas.trim());
    if (params.padengimas.trim()) url.searchParams.set("padengimas", params.padengimas.trim());
    if (params.spalva.trim()) url.searchParams.set("spalva", params.spalva.trim());

    setSummaryLoading(true);
    setSummaryError("");

    return fetch(url.toString())
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setSummary(data);
        setSummaryLoading(false);
        return data;
      })
      .catch((e) => {
        setSummaryError(String(e));
        setSummaryLoading(false);
        throw e;
      });
  }, []);

  const loadFilterOptions = useCallback(() => {
    setFilterOptionsError("");

    return fetch("http://127.0.0.1:8000/pozicijos/api/filter-options/")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        setFilterOptions({
          metalai: Array.isArray(data.metalai) ? data.metalai : [],
          padengimai: Array.isArray(data.padengimai) ? data.padengimai : [],
          spalvos: Array.isArray(data.spalvos) ? data.spalvos : [],
        });
        return data;
      })
      .catch((e) => {
        setFilterOptionsError(String(e));
        throw e;
      });
  }, []);

  const loadRows = useCallback((params) => {
    const url = new URL("http://127.0.0.1:8000/pozicijos/api/preview/");

    if (params.query.trim()) url.searchParams.set("q", params.query.trim());
    if (params.metalas.trim()) url.searchParams.set("metalas", params.metalas.trim());
    if (params.padengimas.trim()) url.searchParams.set("padengimas", params.padengimas.trim());
    if (params.spalva.trim()) url.searchParams.set("spalva", params.spalva.trim());
    if (params.sort.trim()) url.searchParams.set("sort", params.sort.trim());

    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(params.offset));

    setListLoading(true);
    setRowsError("");

    return fetch(url.toString())
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) => {
        const nextRows = Array.isArray(data.results) ? data.results : [];
        setRows(nextRows);
        setTotalCount(Number(data.count) || 0);

        const hasSelectedOnPage = selectedId && nextRows.some((x) => x.id === selectedId);

        if (nextRows.length === 0) {
          navigate("/dashboard-react", { replace: true });
        } else if (!hasSelectedOnPage) {
          navigate(`/dashboard-react/${nextRows[0].id}`, { replace: true });
        }

        setListLoading(false);
        return data;
      })
      .catch((e) => {
        setRowsError(String(e));
        setListLoading(false);
        throw e;
      });
  }, [navigate, selectedId]);

  useEffect(() => {
    loadFilterOptions().catch(() => {});
  }, [loadFilterOptions]);

  useEffect(() => {
    loadSummary({ query, metalas, padengimas, spalva }).catch(() => {});
  }, [query, metalas, padengimas, spalva, loadSummary]);

  useEffect(() => {
    const filtersChanged = prevFiltersKeyRef.current !== filtersKey;

    if (filtersChanged) {
      prevFiltersKeyRef.current = filtersKey;

      if (offset !== 0) {
        setOffset(0);
        return;
      }
    }

    loadRows({ query, metalas, padengimas, spalva, sort, offset }).catch(() => {});
  }, [filtersKey, query, metalas, padengimas, spalva, sort, offset, loadRows]);

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

  function handleReload() {
    Promise.allSettled([
      loadSummary({ query, metalas, padengimas, spalva }),
      loadFilterOptions(),
      loadRows({ query, metalas, padengimas, spalva, sort, offset }),
    ]).then((results) => {
      const failed = results.some((r) => r.status === "rejected");
      toast.show(failed ? "Reload nepavyko" : "Duomenys atnaujinti");
    });
  }

  function selectRow(rowId) {
    navigate(`/dashboard-react/${rowId}`);
  }

  function clearFilters() {
    setQuery("");
    setMetalas("");
    setPadengimas("");
    setSpalva("");
    setSort("newest");
    setOffset(0);
  }

  const activeFilterText = [
    query && `q="${query}"`,
    metalas && `metalas="${metalas}"`,
    padengimas && `padengimas="${padengimas}"`,
    spalva && `spalva="${spalva}"`,
    sort !== "newest" && `sort="${sort}"`,
  ].filter(Boolean).join(" • ");

  const pageFrom = totalCount === 0 ? 0 : offset + 1;
  const pageTo = Math.min(offset + PAGE_SIZE, totalCount);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < totalCount;

  function goPrev() {
    if (!hasPrev) return;
    setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
  }

  function goNext() {
    if (!hasNext) return;
    setOffset((prev) => prev + PAGE_SIZE);
  }

  function onChangeAndReset(setter, value) {
    setter(value);
    setOffset(0);
  }

  return (
    <div className="container">
      <Header
        title="Registras Dashboard"
        subtitle="React dashboard prototipas, kuris ima realius duomenis iš Django API"
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn" onClick={handleReload}>
          {listLoading || summaryLoading ? "Reloading..." : "Reload"}
        </button>
      </div>

      {summaryError ? (
        <div className="card cardPad" style={{ color: "#b42318", marginBottom: 14 }}>
          Summary klaida: {summaryError}
        </div>
      ) : (
        <div className="grid2" style={{ marginBottom: 14 }}>
          <StatCard
            title="Visos pozicijos"
            value={summary ? summary.total : "…"}
            subtitle="Bendras pozicijų kiekis iš Django summary endpointo"
          />
          <StatCard
            title="Su spalva"
            value={summary ? summary.with_color : "…"}
            subtitle="Pozicijos, kurios turi užpildytą spalvą"
          />
        </div>
      )}

      {summary && (
        <div className="grid2" style={{ marginBottom: 14 }}>
          <StatCard
            title="Su padengimu"
            value={summary.with_coating}
            subtitle="Pozicijos, kurios turi užpildytą padengimą"
          />
          <StatCard
            title="Preview rodoma"
            value={rows.length}
            subtitle={activeFilterText || "Paskutinės / atrinktos preview pozicijos"}
          />
        </div>
      )}

      <div className="card cardPad" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <SearchBox
            query={query}
            onQueryChange={(value) => onChangeAndReset(setQuery, value)}
            placeholder="Paieška Django pusėje… (klientas, projektas, metalas, padengimas, spalva)"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 220px", gap: 10 }}>
            <select
              className="input"
              value={metalas}
              onChange={(e) => onChangeAndReset(setMetalas, e.target.value)}
            >
              <option value="">Visi metalai</option>
              {filterOptions.metalai.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              className="input"
              value={padengimas}
              onChange={(e) => onChangeAndReset(setPadengimas, e.target.value)}
            >
              <option value="">Visi padengimai</option>
              {filterOptions.padengimai.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              className="input"
              value={spalva}
              onChange={(e) => onChangeAndReset(setSpalva, e.target.value)}
            >
              <option value="">Visos spalvos</option>
              {filterOptions.spalvos.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              className="input"
              value={sort}
              onChange={(e) => onChangeAndReset(setSort, e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="projektas_asc">Projektas A–Z</option>
              <option value="projektas_desc">Projektas Z–A</option>
              <option value="klientas_asc">Klientas A–Z</option>
              <option value="klientas_desc">Klientas Z–A</option>
            </select>
          </div>

          {filterOptionsError ? (
            <div style={{ color: "#b42318" }}>Filtrų reikšmių klaida: {filterOptionsError}</div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn" onClick={clearFilters}>Clear all</button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--muted)" }}>
                {pageFrom}-{pageTo} iš {totalCount}
              </span>
              <button className="btn" onClick={goPrev} disabled={!hasPrev}>Prev</button>
              <button className="btn" onClick={goNext} disabled={!hasNext}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {rowsError ? (
        <div className="card cardPad" style={{ color: "#b42318" }}>
          Sąrašo klaida: {rowsError}
        </div>
      ) : (
        <div className="grid2" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
          <div className="card list">
            {listLoading ? (
              <div className="cardPad" style={{ color: "var(--muted)" }}>
                Krauna sąrašą...
              </div>
            ) : rows.length === 0 ? (
              <div className="cardPad" style={{ color: "var(--muted)" }}>
                Nieko nerasta.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className={selectedId === row.id ? "row row--accent row--selected" : "row row--accent"}
                  onClick={() => selectRow(row.id)}
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

                <div style={{ marginBottom: 14 }}>
                  <a
                    className="pill"
                    href={`http://127.0.0.1:8000/pozicijos/${detail.id}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Django page
                  </a>
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
