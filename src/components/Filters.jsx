import { useCategories } from "../store/categoriesStore.jsx";

function Filters({ activeCategory, setActiveCategory }) {
  const { categories } = useCategories();

  // =========================
  // NORMALIZAR CATEGORÍAS
  // =========================
  const normalize = (raw) => {
    const base = String(raw || "").split("-")[0].trim();
    if (!base) return null;
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const uniqueCategories = Array.from(
    new Set((categories || []).map(normalize).filter(Boolean))
  );

  return (
    <section className="filters">
      <button
        className={`chip ${activeCategory === "Todo" ? "chip-active" : ""}`}
        onClick={() => setActiveCategory("Todo")}
      >
        Todo
      </button>

      {uniqueCategories.map((cat) => (
        <button
          key={cat}
          className={`chip ${activeCategory === cat ? "chip-active" : ""}`}
          onClick={() => setActiveCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </section>
  );
}

export default Filters;
