import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ItemsContext = createContext(null);

const STORAGE_KEY = "my-react-items-v1";

const initialItems = [
  { id: 1, name: "Varžtas M6", category: "Tvirtinimas", price: 0.12, stock: 1200, note: "Cinkuotas." },
  { id: 2, name: "Veržlė M6", category: "Tvirtinimas", price: 0.08, stock: 980, note: "DIN 934." },
  { id: 3, name: "Plokštė 2mm", category: "Metalas", price: 14.5, stock: 32, note: "Plienas S235." },
  { id: 4, name: "Gruntas", category: "Danga", price: 7.5, stock: 10, note: "Skirtas metalui." },
];

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialItems;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialItems;
    return parsed;
  } catch {
    return initialItems;
  }
}

export function ItemsProvider({ children }) {
  const [items, setItems] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  function addItem(payload) {
    const id = Date.now();
    const newItem = { id, ...payload };
    setItems((prev) => [newItem, ...prev]);
    return id;
  }

  function updateItem(id, patch) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function resetItems() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setItems(initialItems);
  }

  function replaceItems(nextItems) {
    if (!Array.isArray(nextItems)) return false;
    setItems(nextItems);
    return true;
  }

  const value = useMemo(
    () => ({ items, addItem, updateItem, deleteItem, resetItems, replaceItems }),
    [items]
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems() turi būti naudojamas ItemsProvider viduje");
  return ctx;
}
