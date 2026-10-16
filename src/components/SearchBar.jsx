export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-field">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <span className="visually-hidden">Buscar inventario</span>
      <input
        type="search"
        placeholder="Buscar por producto o categoría..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
