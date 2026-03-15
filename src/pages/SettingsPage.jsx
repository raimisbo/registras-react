import Header from "../components/Header.jsx";
import { useToast } from "../components/ToastHost.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import { useUsers } from "../context/UsersContext.jsx";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const toast = useToast();
  const { items, replaceItems } = useItems();
  const { users, replaceUsers } = useUsers();

  function exportItems() {
    downloadJson("items.json", items);
    toast.show("Items eksportuoti");
  }

  function exportUsers() {
    downloadJson("users.json", users);
    toast.show("Users eksportuoti");
  }

  function exportAll() {
    downloadJson("app-data.json", {
      items,
      users,
      exportedAt: new Date().toISOString(),
      version: 1,
    });
    toast.show("Visi duomenys eksportuoti");
  }

  async function importAllFromFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const nextItems = parsed?.items;
      const nextUsers = parsed?.users;

      let changed = false;

      if (Array.isArray(nextItems)) {
        replaceItems(nextItems);
        changed = true;
      }

      if (Array.isArray(nextUsers)) {
        replaceUsers(nextUsers);
        changed = true;
      }

      if (!changed) {
        toast.show("Faile nerasta items/users masyvų");
      } else {
        toast.show("Duomenys importuoti");
      }
    } catch {
      toast.show("Nepavyko importuoti JSON");
    } finally {
      // leidžia importuoti tą patį failą dar kartą
      event.target.value = "";
    }
  }

  return (
    <div className="container">
      <Header
        title="Settings"
        subtitle="Export / Import JSON duomenims išsisaugoti arba atkurti"
      />

      <div className="grid2">
        <div className="card cardPad">
          <div className="cardTitle">Export</div>

          <div style={{ display: "grid", gap: 10 }}>
            <button className="btn" onClick={exportItems}>Export Items</button>
            <button className="btn" onClick={exportUsers}>Export Users</button>
            <button className="btn btnPrimary" onClick={exportAll}>Export All</button>
          </div>
        </div>

        <div className="card cardPad">
          <div className="cardTitle">Import</div>

          <div style={{ color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
            Pasirink JSON failą. Jei faile bus <b style={{ color: "var(--text)" }}>items</b> ir/ar
            <b style={{ color: "var(--text)" }}> users</b> masyvai, jie pakeis dabartinius duomenis.
          </div>

          <label className="btn" style={{ display: "inline-block", cursor: "pointer" }}>
            Import All
            <input
              type="file"
              accept="application/json,.json"
              onChange={importAllFromFile}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
