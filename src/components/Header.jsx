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

  // 🔍 Autocomplete
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

  // =========================
  // CARGAR CATEGORÍAS REALES
  // =========================
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase.rpc("filter_options");
      if (error) return;

      const clean =
        (data?.categorias || [])
          .filter((c) => typeof c === "string" && c.trim() !== "")
          .map((c) => c.trim());

      setAllCategories(Array.from(new Set(clean)));
    };

    loadCategories();
  }, []);

  // =========================
  // CERRAR AUTOCOMPLETE AL CAMBIAR DE RUTA
  // =========================
  useEffect(() => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    suppressAutocompleteRef.current = true;
  }, [location.pathname]);

  // =========================
  // SINCRONIZAR SEARCH EXTERNO
  // =========================
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

  // =========================
  // POSICIÓN DROPDOWN
  // =========================
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

  // =========================
  // TECLADO
  // =========================
  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
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

        suppressAutocompleteRef.current = true;
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setSearch(selected);

        if (!isBuscarPage) {
          navigate(`/buscar?q=${encodeURIComponent(selected)}`);
        }
        return;
      }
    }

    if (e.key === "Enter") {
      const term = search.trim();
      if (!term) return;

      suppressAutocompleteRef.current = true;
      setShowSuggestions(false);
      setHighlightedIndex(-1);

      if (!isBuscarPage) {
        navigate(`/buscar?q=${encodeURIComponent(term)}`);
      }
    }
  };

  // =========================
  // AUTOCOMPLETE
  // =========================
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

  const toggleSidebar = () => {
    document.body.classList.toggle("sidebar-open");
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* BOTÓN MENÚ MOBILE */}
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <Link to="/" className="logo">ENACTO</Link>

        <div className="search-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Buscar profesionales, servicios o usuarios..."
            value={search}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length && !suppressAutocompleteRef.current) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />

          <button
            className="search-filter-inside"
            onClick={() => setShowFilters((v) => !v)}
          >
            ⚙️
          </button>
        </div>

        {/* =========================
            ACCIONES DERECHA (AUTH)
           ========================= */}
        <div className="header-actions">
          {!loading && !user && (
            <div className="header-auth-buttons">
              <Link to="/login" className="header-login-btn">
                Iniciar sesión
              </Link>
              <Link to="/register" className="header-register-btn">
                Registrarse
              </Link>
            </div>
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
          <ul
            className="search-suggestions"
            style={{
              ...dropdownStyle,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
              padding: "8px 0",
            }}
          >
            {suggestions.map((s, i) => (
              <li
                key={s}
                onMouseDown={() => {
                  suppressAutocompleteRef.current = true;
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                  setSearch(s);

                  if (!isBuscarPage) {
                    navigate(`/buscar?q=${encodeURIComponent(s)}`);
                  }
                }}
                style={{
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#111827",
                  background: i === highlightedIndex ? "#eef2f7" : "transparent",
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
