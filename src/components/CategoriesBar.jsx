import "./CategoriesBar.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function CategoriesBar() {
  const [categories, setCategories] = useState([]);
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // =========================
  // CARGAR CATEGORÍAS (ÚNICA FUENTE: filter_options)
  // =========================
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase.rpc("filter_options");

      if (error) {
        console.error("❌ CategoriesBar: error cargando filter_options", error);
        return;
      }

      if (!data || !Array.isArray(data.categorias)) {
        console.warn("⚠️ CategoriesBar: filter_options sin categorias");
        return;
      }

      setCategories(data.categorias);
    };

    loadCategories();
  }, []);

  // =========================
  // OCULTAR AL SCROLL
  // =========================
  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 60) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleCategories = expanded
    ? categories
    : categories.slice(0, 8);

  if (categories.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`categories-bar ${hidden ? "hidden" : ""}`}
    >
      {visibleCategories.map((cat) => (
        <button
          key={cat}
          className="category-chip"
          onClick={() =>
            navigate(`/buscar?categoria=${encodeURIComponent(cat)}`)
          }
        >
          {cat}
        </button>
      ))}

      {categories.length > visibleCategories.length && (
        <button
          className="category-chip more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

export default CategoriesBar;
