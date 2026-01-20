import "./Header.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CategoriesBar from "./CategoriesBar";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";

function Header({ search, setSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  const [showFilters, setShowFilters] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const suppressAutocompleteRef = useRef(false);
  const lastSearchRef = useRef(search);
  const typingRef = useRef(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const isBuscarPage = location.pathname === "/buscar";
  const allowSuggestions = location.pathname === "/" || isBuscarPage;

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.rpc("filter_options");
      if (!data) return;

      const clean = (data?.categorias || [])
        .filter((c) => typeof c === "string" && c.trim() !== "")
        .map((c) => c.trim());

      setAllCategories(Array.from(new Set(clean)));
    };

    loadCategories();
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    suppressAutocompleteRef.current = true;
  }, [location.pathname]);

  useEffect(() => {
    if (typingRef.current) {
      typingRef.current = false;
      lastSearchRef.current = search;
      return;
    }

    if (lastSearchRef.current !== search) {
      suppressAutocompleteRef.current = true;
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      lastSearchRef.current = search;

      setTimeout(() => {
        suppressAutocompleteRef.current = false;
      }, 0);
    }
  }, [search]);

  useEffect(() => {
    if (!showSuggestions || !inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [showSuggestions, suggestions]);

  useEffect(() => {
    if (!allowSuggestions) return;
    if (suppressAutocompleteRef.current) return;

    const q = search.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const matches = allCategories
        .filter((c) => c.toLowerCase().includes(q))
        .slice(0, 8);

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
      setHighlightedIndex(-1);
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [search, allCategories, allowSuggestions]);

  const handleChange = (e) => {
    typingRef.current = true;
    suppressAutocompleteRef.current = false;
    setSearch(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          Math.min(i + 1, suggestions.length - 1)
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[highlightedIndex];
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setSearch(selected);
        if (!isBuscarPage)
          navigate(`/buscar?q=${encodeURIComponent(selected)}`);
        return;
      }
    }

    if (e.key === "Enter") {
      const term = search.trim();
      if (!term) return;
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      if (!isBuscarPage)
        navigate(`/buscar?q=${encodeURIComponent(term)}`);
    }
  };

  // 🔹 Sidebar toggle SOLO mobile
  const toggleSidebar = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;
    document.body.classList.toggle("sidebar-open");
  };

  return (
    <header className="header">
      <div className="header-inner">

        {/* BOTÓN SIDEBAR (oculto en desktop por CSS) */}
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {/* LOGO */}
        <Link to="/" className="logo">
          ENACTO
        </Link>

        {/* BUSCADOR */}
        <div className="search-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Buscar profesionales, servicios o usuarios..."
            value={search}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            className="search-filter-inside"
            onClick={() => setShowFilters((v) => !v)}
          >
            ⚙️
          </button>
        </div>

        {/* MI CUENTA */}
        <div className="header-actions">
          {!loading && !user && (
            <Link to="/login" className="header-login-btn">
              Iniciar sesión
            </Link>
          )}

          {user && !loading && (
            <div
              className="profile-btn"
              onClick={() => navigate("/mi-cuenta")}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-circle" />
              )}
            </div>
          )}
        </div>

      </div>

      {showFilters && (
        <div className="filters-panel-placeholder">
          (filtros avanzados en el próximo paso)
        </div>
      )}

      <CategoriesBar />

      {showSuggestions &&
        dropdownStyle &&
        createPortal(
          <ul className="search-suggestions" style={dropdownStyle}>
            {suggestions.map((s, i) => (
              <li
                key={s}
                className={i === highlightedIndex ? "active" : ""}
                onMouseDown={() => {
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                  setSearch(s);
                  if (!isBuscarPage)
                    navigate(`/buscar?q=${encodeURIComponent(s)}`);
                }}
              >
                {s}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </header>
  );
}

export default Header;
