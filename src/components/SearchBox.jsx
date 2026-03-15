export default function SearchBox({ query, onQueryChange, placeholder = "Paieška…" }) {
  return (
    <input
      className="input"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
