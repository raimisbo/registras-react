import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UsersContext = createContext(null);

const STORAGE_KEY = "my-react-users-v1";

const initialUsers = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "leanne@example.com",
    phone: "1-770-736-8031",
    website: "leanne.dev",
    company: { name: "Romaguera-Crona", catchPhrase: "Multi-layered client-server neural-net" },
    address: { city: "Gwenborough", street: "Kulas Light", suite: "Apt. 556" },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "ervin@example.com",
    phone: "010-692-6593",
    website: "ervin.dev",
    company: { name: "Deckow-Crist", catchPhrase: "Proactive didactic contingency" },
    address: { city: "Wisokyburgh", street: "Victor Plains", suite: "Suite 879" },
  },
  {
    id: 3,
    name: "Clementine Bauch",
    username: "Samantha",
    email: "clementine@example.com",
    phone: "1-463-123-4447",
    website: "clementine.dev",
    company: { name: "Romaguera-Jacobson", catchPhrase: "Face to face bifurcated interface" },
    address: { city: "McKenziehaven", street: "Douglas Extension", suite: "Suite 847" },
  },
];

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialUsers;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialUsers;
    return parsed;
  } catch {
    return initialUsers;
  }
}

export function UsersProvider({ children }) {
  const [users, setUsers] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  function addUser(payload) {
    const id = Date.now();
    const newUser = { id, ...payload };
    setUsers((prev) => [newUser, ...prev]);
    return id;
  }

  function updateUser(id, patch) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }

  function deleteUser(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function resetUsers() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUsers(initialUsers);
  }

  function replaceUsers(nextUsers) {
    if (!Array.isArray(nextUsers)) return false;
    setUsers(nextUsers);
    return true;
  }

  const value = useMemo(
    () => ({ users, addUser, updateUser, deleteUser, resetUsers, replaceUsers }),
    [users]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers() turi būti naudojamas UsersProvider viduje");
  return ctx;
}
