import "./Feed.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "../supabaseClient";

const MAX_TOTAL = 60;
const NEW_COUNT = 20;
const RANDOM_COUNT = 40;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function Feed({ search, filtros, filters, showHero = true }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const effectiveFilters = filters ?? filtros ?? {};

  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshTimeout = useRef(null);

  const filtersKey = useMemo(() => {
    const f = effectiveFilters || {};
    return JSON.stringify({
      categoria: f.categoria || "",
      subcategoria: f.subcategoria || "",
      provincia: f.provincia || "",
      localidad: f.localidad || "",
    });
  }, [
    effectiveFilters?.categoria,
    effectiveFilters?.subcategoria,
    effectiveFilters?.provincia,
    effectiveFilters?.localidad,
  ]);

  const hasActiveFilters = useMemo(() => {
    const f = effectiveFilters || {};
    return Object.values({
      categoria: f.categoria,
      subcategoria: f.subcategoria,
      provincia: f.provincia,
      localidad: f.localidad,
    }).some((v) => v && String(v).trim() !== "");
  }, [
    effectiveFilters?.categoria,
    effectiveFilters?.subcategoria,
    effectiveFilters?.provincia,
    effectiveFilters?.localidad,
  ]);

  // =========================
  // CARGAR FEED
  // =========================
  const cargarFeed = async () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }

    setLoading(true);
    const term = search?.trim();

   // 🔍 BÚSQUEDA / FILTROS
   console.log("🔎 Feed.cargarFeed", {
  search,
  effectiveFilters,
  hasActiveFilters,
});

if ((term && term.length > 0) || hasActiveFilters) {
  const payload = {
    p_text: term || null,
    p_categoria: effectiveFilters?.categoria || null,
    p_subcategoria: effectiveFilters?.subcategoria || null,
    p_provincia: effectiveFilters?.provincia || null,
    p_localidad: effectiveFilters?.localidad || null,
    p_limit: MAX_TOTAL,
    p_offset: 0, // 👈 ESTE ERA EL QUE FALTABA
  };

  const { data, error } = await supabase.rpc(
    "search_profiles",
    payload
  );
  console.log("📡 RPC response", { data, error });


  if (error) {
    console.error("❌ RPC search_profiles FAILED", error);
  }

  setPerfiles(!error && data ? data : []);
  setLoading(false);
  return;
}


    // 🧠 FEED HOME
    const baseSelect = `
      id,
      slug,
      full_name,
      avatar_url,
      avatar_color,
      provincia,
      localidad,
      subcategorias
    `;

    const { data: nuevos } = await supabase
      .from("profiles")
      .select(baseSelect)
      .eq("is_professional", true)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(NEW_COUNT);

    const randomOffset = Math.floor(Math.random() * 200);

    const { data: randoms } = await supabase
      .from("profiles")
      .select(baseSelect)
      .eq("is_professional", true)
      .eq("status", "active")
      .range(randomOffset, randomOffset + RANDOM_COUNT - 1);

    const map = new Map();
    [...(nuevos || []), ...(randoms || [])].forEach((p) => {
      map.set(p.id, p);
    });

    setPerfiles(shuffle([...map.values()]).slice(0, MAX_TOTAL));
    setLoading(false);

    refreshTimeout.current = setTimeout(
      cargarFeed,
      Math.floor(Math.random() * (90_000 - 45_000)) + 45_000
    );
  };

  useEffect(() => {
    cargarFeed();

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [search, filtersKey, hasActiveFilters]);

  // =========================
  // HERO
  // =========================
  const renderHero = () => (
    <div className="feed-hero">
      <h2>Hecho por emprendedores, para emprendedores</h2>
      <p>
        Buscá profesionales, servicios y negocios reales en tu ciudad.
        Explorá perfiles y conectá directo.
      </p>
    </div>
  );

  // =========================
  // FEED
  // =========================
  const renderFeed = () => (
    <div className="feed-real feed-grid">
      {loading && <p>Cargando profesionales...</p>}

      {!loading && perfiles.length === 0 && (
        <p>No se encontraron profesionales.</p>
      )}

      {!loading &&
        perfiles.map((perfil) => {
          const initial =
            perfil.full_name?.charAt(0)?.toUpperCase() ?? "?";

          const categoria = (() => {
            const subs = Array.isArray(perfil.subcategorias)
              ? perfil.subcategorias
              : [];

            if (subs.length > 0) {
              const categoriasUnicas = Array.from(
                new Set(
                  subs
                    .map((s) =>
                      String(s).split("::")[0].trim()
                    )
                    .filter(Boolean)
                )
              ).map(
                (c) =>
                  c.charAt(0).toUpperCase() +
                  c.slice(1)
              );

              return categoriasUnicas.join(" · ");
            }

            return null;
          })();

          return (
            <Link
              key={perfil.id}
              to={`/perfil/${perfil.slug}`}
              className="feed-card-minimal"
            >
              <div className="card-avatar">
                {perfil.avatar_url ? (
                  <img
                    src={perfil.avatar_url}
                    alt={perfil.full_name}
                  />
                ) : (
                  <div
                    className="avatar-placeholder"
                    style={{
                      backgroundColor:
                        perfil.avatar_color || "#E6E6FA",
                    }}
                  >
                    {initial}
                  </div>
                )}
              </div>

              <div className="card-content">
                <div
                  className="card-header"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "6px",
                  }}
                >
                  <h3>{perfil.full_name}</h3>

                  {categoria && (
                    <div
                      className="card-category"
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        borderRadius: "999px",
                        background: "#f2f2f2",
                        color: "#444",
                        fontWeight: 500,
                      }}
                    >
                      {categoria}
                    </div>
                  )}
                </div>

                <div className="card-location">
                  {perfil.localidad}, {perfil.provincia}
                </div>
              </div>
            </Link>
          );
        })}
    </div>
  );

  return (
    <div className="feed-container">
      {showHero && renderHero()}
      {renderFeed()}

      {showHero && !user && (
        <div className="feed-cta">
          <Link
            to="/login"
            className="feed-empty-btn secondary"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="feed-empty-btn"
          >
            Crear cuenta
          </Link>
        </div>
      )}

      {showHero && user && !profile?.is_professional && (
        <div className="feed-cta">
          <button
            className="feed-empty-btn"
            onClick={() =>
              navigate(
                "/asistente-profesional/paso-1"
              )
            }
          >
            Crear cuenta profesional
          </button>
        </div>
      )}
    </div>
  );
}

export default Feed;
