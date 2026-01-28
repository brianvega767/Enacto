import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import { supabase } from "../supabaseClient";
import "../App.css";

// =========================
// 🔹 NORMALIZADORES (CLAVE)
// =========================
const normalizeCategory = (raw) => {
  if (!raw) return "";
  const str = String(raw || "").trim();
  if (!str) return "";

  // Caso nuevo: "Fotografía Y Video::Fotografía::Eventos"
  if (str.includes("::")) {
    const parts = str.split("::");
    if (parts.length >= 2) return parts[1].trim();
  }

  // Caso viejo: "fotografia-bodas"
  if (str.includes("-")) {
    return str.split("-")[0].trim();
  }

  return str.trim();
};

const uiCap = (s) => {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Buscar() {
  const [params, setParams] = useSearchParams();

  // ✅ MOBILE REACTIVO (no depende de reload)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [search, setSearch] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(null);
  const [offset, setOffset] = useState(0);

  // 🔎 filtros
  const [filters, setFilters] = useState({
    categoria: "",
    subcategoria: "",
    provincia: "",
    localidad: "",
  });

  // 🔹 opciones reales
  const [filterOptions, setFilterOptions] = useState({
    categorias: [],
    subcategoriasPorCategoria: {},
    provincias: [],
    localidadesPorProvincia: {},
  });

  // ✅ FIX: localidades por provincia
  const [localidades, setLocalidades] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const rafRef = useRef(null);

  const userEditingRef = useRef(false);
  const applyingFromUrlRef = useRef(false);

  const handleSetSearch = (value) => {
    if (!applyingFromUrlRef.current) {
      userEditingRef.current = true;
      if (value === "") {
        setFilters((f) => ({ ...f, categoria: "" }));
      }
    }
    setSearch(value);
  };

  // =========================
  // 🔹 SINCRONIZA DESDE URL
  // =========================
  useEffect(() => {
    if (userEditingRef.current) return;

    applyingFromUrlRef.current = true;

    const q = params.get("q");
    const categoria = params.get("categoria");

    if (q && q.trim()) {
      setSearch(q);
    } else {
      setSearch("");
    }

    setFilters({
      categoria: uiCap(normalizeCategory(categoria)) || "",
      subcategoria: params.get("subcategoria") || "",
      provincia: params.get("provincia") || "",
      localidad: params.get("localidad") || "",
    });

    setTimeout(() => {
      applyingFromUrlRef.current = false;
    }, 0);
  }, [params]);

  // =========================
  // 🔹 DEBOUNCE
  // =========================
  useEffect(() => {
    if (search === null) return;

    const t = setTimeout(() => {
      setDebouncedSearch(search);
      userEditingRef.current = false;
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  // =========================
  // 🔹 URL
  // =========================
  useEffect(() => {
    if (debouncedSearch === null) return;

    const newParams = {};
    if (debouncedSearch.trim()) newParams.q = debouncedSearch.trim();

    Object.entries(filters).forEach(([k, v]) => {
      if (v) newParams[k] = v;
    });

    setParams(newParams);
  }, [debouncedSearch, filters, setParams]);

  // =========================
  // 🔹 OFFSET
  // =========================
  useEffect(() => {
    function updateOffset() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const header = document.querySelector(".header");
        const categories = document.querySelector(".categories-bar");

        let h = 0;
        if (header) h += header.getBoundingClientRect().height;
        if (categories && !categories.classList.contains("hidden")) {
          h += categories.getBoundingClientRect().height;
        }

        setOffset(h + 10);
      });
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    window.addEventListener("scroll", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [debouncedSearch]);

  // =========================
  // 🔹 CARGAR OPCIONES (ROBUSTO)
  // =========================
  useEffect(() => {
    async function loadFilterOptions() {
      // Provincias (esto ya estaba OK)
      const { data: provs } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

      // 1) Intento por RPC (rápido si existe y devuelve bien)
      const { data: catsRpc, error: rpcErr } = await supabase.rpc("filter_options");

      // Si el RPC devuelve bien, lo usamos
      if (!rpcErr && catsRpc && (catsRpc.categorias || catsRpc.subcategorias_por_categoria)) {
        setFilterOptions({
          categorias: catsRpc?.categorias || [],
          subcategoriasPorCategoria: catsRpc?.subcategorias_por_categoria || {},
          provincias: provs || [],
          localidadesPorProvincia: {},
        });
        return;
      }

      // 2) Fallback (si RPC falló o vino vacío): armar desde tablas reales
      console.warn("⚠️ filter_options no disponible o vacío, usando fallback desde tablas.");

      const [{ data: cats }, { data: subs }] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("subcategories")
          .select("category_id, label, value, is_active")
          .eq("is_active", true)
          .order("order_index", { ascending: true }),
      ]);

      const categorias = (cats || []).map((c) => c.name).filter(Boolean);

      // Map: categoryName -> [sub.value]
      const nameById = new Map((cats || []).map((c) => [c.id, c.name]));
      const subMap = {};
      (subs || []).forEach((s) => {
        const catName = nameById.get(s.category_id);
        if (!catName) return;
        if (!subMap[catName]) subMap[catName] = [];
        if (s.value) subMap[catName].push(s.value);
      });

      setFilterOptions({
        categorias,
        subcategoriasPorCategoria: subMap,
        provincias: provs || [],
        localidadesPorProvincia: {},
      });
    }

    loadFilterOptions();
  }, []);

  // =========================
  // 🔹 LOCALIDADES POR PROVINCIA
  // =========================
  useEffect(() => {
    if (!filters.provincia) {
      setLocalidades([]);
      return;
    }

    async function loadLocalidades() {
      const provinciaId = filterOptions.provincias.find((p) => p.name === filters.provincia)?.id;

      if (!provinciaId) {
        setLocalidades([]);
        return;
      }

      const { data } = await supabase
        .from("cities")
        .select("name")
        .eq("province_id", provinciaId)
        .order("name")
        .range(0, 10000);

      setLocalidades((data || []).map((l) => l.name));
    }

    loadLocalidades();
  }, [filters.provincia, filterOptions.provincias]);

  // =========================
  // 🔹 NORMALIZAR CATEGORÍAS (UI)
  // =========================
  const categoriasDisponibles = useMemo(() => {
    // filterOptions.categorias puede venir como:
    // - array de strings simples
    // - array de strings con "::"
    // - array vieja con "-"
    const cleaned = (filterOptions.categorias || [])
      .map((c) => normalizeCategory(c))
      .filter(Boolean)
      .map((c) => uiCap(c));

    return Array.from(new Set(cleaned));
  }, [filterOptions.categorias]);

  // =========================
  // 🔹 MAPA NORMALIZADO DE SUBCATEGORÍAS POR CATEGORÍA (CLAVE)
  // =========================
  const subMapNormalized = useMemo(() => {
    const src = filterOptions.subcategoriasPorCategoria || {};
    const out = {};

    Object.entries(src).forEach(([k, arr]) => {
      // k puede venir:
      // - "Fotografía"
      // - "Fotografía Y Video::Fotografía::Eventos"
      // - "fotografia-bodas"
      const keyNorm = uiCap(normalizeCategory(k));
      if (!keyNorm) return;

      const list = Array.isArray(arr) ? arr : [];
      // Mantener value intacto para el RPC
      // Solo limpiamos labels en UI
      out[keyNorm] = list;
    });

    return out;
  }, [filterOptions.subcategoriasPorCategoria]);

  const rawSubs =
    filters.categoria && subMapNormalized[filters.categoria]
      ? subMapNormalized[filters.categoria]
      : [];

  // ✅ FIX: label limpio para subcategorías (manteniendo value intacto)
  const subcategoriasDisponibles = (rawSubs || []).map((s) => {
    const full = String(s || "").trim();

    // 1) si viene con ::, me quedo con la última parte (sub visible)
    const parts = full.split("::");
    const last = parts[parts.length - 1]?.trim() || "";

    // 2) si viene con -, me quedo con la última parte (ej: fotografia-bodas -> bodas)
    let clean = last;

    // quitar prefijo "fotografia-" o "video-"
    clean = clean.replace(/^fotografia-/, "");
    clean = clean.replace(/^video-/, "");

    // reemplazar guiones por espacios
    clean = clean.replace(/-/g, " ");

    // 3) capitalizo para UI
    const label = clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";

    return {
      label,
      value: full, // 🔑 el value real se conserva para el RPC
    };
  });

  const localidadesDisponibles = filters.provincia ? localidades : [];

  if (search === null || debouncedSearch === null) return null;

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="main-content">
        <Header search={search} setSearch={handleSetSearch} />

        <div className="feed-wrapper" style={{ paddingTop: offset }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "32px",
              marginBottom: "36px",

              // ✅ FIX MOBILE: el corte venía de acá
              // En desktop mantenemos tu diseño tal cual
              transform: isMobile ? "none" : "translateX(-120px)",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "999px",
                padding: isMobile ? "15px 25px" : "14px 34px",
                cursor: "pointer",
                fontSize: "24px",
                fontWeight: 800,
                color: "#111827",
                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                transition: "all 0.2s ease",
                marginBottom: showFilters ? "22px" : "0",
                marginTop: isMobile ? "45px" : "60px",   // 👈 ACÁ
                marginBottom: showFilters ? "22px" : "0",
              }}
            >
              🔎 Filtrar búsqueda
            </button>

            {showFilters && (
              <div
                style={{
                  width: "100%",
                  // ✅ FIX MOBILE: que no quede limitado
                  maxWidth: isMobile ? "100%" : "720px",
                  background: "#ffffff",
                  // ✅ FIX MOBILE: panel a pantalla completa del contenedor
                  borderRadius: isMobile ? "16px" : "22px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                  padding: isMobile ? "18px 14px" : "32px",

                  // ✅ evita que se recorte por layouts raros
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    // ✅ FIX MOBILE: una columna
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? "14px" : "20px",
                  }}
                >
                  {/* CATEGORÍA */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Categoría
                    </label>
                    <select
                      value={filters.categoria}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          categoria: e.target.value,
                          subcategoria: "",
                        }))
                      }
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: isMobile ? "12px 12px" : "12px 14px",
                        fontSize: isMobile ? "16px" : "15px", // ✅ evita zoom iOS + mejor tacto
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                      }}
                    >
                      <option value="">Todas</option>
                      {categoriasDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SUBCATEGORÍA */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Subcategoría
                    </label>
                    <select
                      value={filters.subcategoria}
                      disabled={!filters.categoria}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          subcategoria: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: isMobile ? "12px 12px" : "12px 14px",
                        fontSize: isMobile ? "16px" : "15px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        opacity: filters.categoria ? 1 : 0.5,
                      }}
                    >
                      <option value="">Todas</option>
                      {subcategoriasDisponibles.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PROVINCIA */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Provincia
                    </label>
                    <select
                      value={filters.provincia}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          provincia: e.target.value,
                          localidad: "",
                        }))
                      }
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: isMobile ? "12px 12px" : "12px 14px",
                        fontSize: isMobile ? "16px" : "15px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                      }}
                    >
                      <option value="">Todas</option>
                      {filterOptions.provincias.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LOCALIDAD */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Localidad
                    </label>
                    <select
                      value={filters.localidad}
                      disabled={!filters.provincia}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          localidad: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: isMobile ? "12px 12px" : "12px 14px",
                        fontSize: isMobile ? "16px" : "15px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        opacity: filters.provincia ? 1 : 0.5,
                      }}
                    >
                      <option value="">Todas</option>
                      {localidadesDisponibles.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Feed search={debouncedSearch} filters={filters} showHero={false} />
        </div>
      </div>
    </div>
  );
}

export default Buscar;
