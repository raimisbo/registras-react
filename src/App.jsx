import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ItemsPage from "./pages/ItemsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import UserDetailsPage from "./pages/UserDetailsPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ReactDashboardPage from "./pages/ReactDashboardPage.jsx";

const THEME_KEY = "my-react-theme-v2";

function applyTheme(resolvedTheme) {
  const root = document.documentElement;
  if (resolvedTheme === "dark") root.classList.add("theme-dark");
  else root.classList.remove("theme-dark");
}

function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialMode() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "auto" || saved === "dark" || saved === "light") return saved;
  return "auto";
}

function TopBar({ themeMode, onCycleTheme }) {
  const pill = ({ isActive }) => `pill ${isActive ? "active" : ""}`;
  const label = themeMode === "auto" ? "Auto" : themeMode === "dark" ? "Dark" : "Light";

  return (
    <div className="topbar">
      <div className="topbar__inner">
        <div className="brand">My React</div>

        <div className="navlinks">
          <NavLink to="/" end className={pill}>Home</NavLink>
          <NavLink to="/items" className={pill}>Items</NavLink>
          <NavLink to="/users" className={pill}>Users</NavLink>
          <NavLink to="/settings" className={pill}>Settings</NavLink>
          <NavLink to="/dashboard-react" className={pill}>Dashboard React</NavLink>

          <button className="btn" onClick={onCycleTheme} style={{ padding: "8px 12px" }}>
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState(getInitialMode);
  const resolvedTheme = useMemo(() => resolveTheme(themeMode), [themeMode]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "auto" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(resolveTheme("auto"));

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, [themeMode]);

  function cycleTheme() {
    setThemeMode((m) => (m === "auto" ? "light" : m === "light" ? "dark" : "auto"));
  }

  return (
    <div className="shell">
      <TopBar themeMode={themeMode} onCycleTheme={cycleTheme} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard-react" element={<ReactDashboardPage />} />
        <Route path="/dashboard-react/:id" element={<ReactDashboardPage />} />
        <Route path="*" element={<div className="container">404</div>} />
      </Routes>
    </div>
  );
}
