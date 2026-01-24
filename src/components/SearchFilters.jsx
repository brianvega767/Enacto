import { createPortal } from "react-dom";
import "./SearchFilters.css";

function SearchFilters({
  filters,
  setFilters,
  options,
  isOpen,
  onClose,
}) {
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || null,
    }));
  };

  const normalizeCategory = (raw) => {
    if (!raw) return null;
    const str = String(raw);

    if (str.includes("::")) {
      const parts = str.split("::");
      if (parts.length >= 2) {
        return parts[1].trim();
      }
    }

    if (str.includes("-")) {
      return str.split("-")[0].trim();
    }

    return str.trim();
  };

  const categoriasUnicas = Array.from(
    new Set(
      (options.categorias || [])
        .map(normalizeCategory)
        .filter(Boolean)
        .map(
          (c) => c.charAt(0).toUpperCase() + c.slice(1)
        )
    )
  );

  const rawSubs =
    filters.categoria &&
    options.subcategoriasPorCategoria &&
    options.subcategoriasPorCategoria[filters.categoria]
      ? options.subcategoriasPorCategoria[filters.categoria]
      : [];

  const subcategoriasDisponibles = rawSubs.map((s) => {
    const parts = String(s).split("-");
    const label = parts[parts.length - 1];
    return {
      value: s,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });

  // 🔥 Si está cerrado, no renderizamos nada
  if (!isOpen) return null;

  // 🔥 PORTAL: sacamos el panel fuera del layout
  return createPortal(
    <div className="search-filters">
      <div className="filters-header">
        <span>Filtrar búsqueda</span>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="filters-grid">
        <select
          value={filters.categoria || ""}
          onChange={(e) =>
            handleChange("categoria", e.target.value)
          }
        >
          <option value="">Categoría</option>
          {categoriasUnicas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.subcategoria || ""}
          disabled={!filters.categoria}
          onChange={(e) =>
            handleChange("subcategoria", e.target.value)
          }
        >
          <option value="">Subcategoría</option>
          {subcategoriasDisponibles.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.provincia || ""}
          onChange={(e) =>
            handleChange("provincia", e.target.value)
          }
        >
          <option value="">Provincia</option>
          {(options.provincias || []).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filters.localidad || ""}
          onChange={(e) =>
            handleChange("localidad", e.target.value)
          }
        >
          <option value="">Localidad</option>
          {(options.localidades || []).map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>,
    document.body
  );
}

export default SearchFilters;
