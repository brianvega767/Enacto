import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LegalModal from "../components/legal/LegalModal";
import { X, Truck, MoreVertical, Flag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import "./PerfilPublico.css";

function PerfilPublico() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openLegal, setOpenLegal] = useState(false);
  const [showRealContact, setShowRealContact] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [activeImage, setActiveImage] = useState(null);

  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // =========================
  // CARGA PERFIL
  // =========================
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      setProfile(data || null);
      setLoading(false);
    };

    loadProfile();
  }, [slug]);

  // =========================
  // CARGA PORTFOLIO
  // =========================
  useEffect(() => {
    if (!profile?.id) return;

    const loadPortfolio = async () => {
      setLoadingPortfolio(true);

      const { data, error } = await supabase
        .from("portfolio_images")
        .select("id, image_url, position, created_at")
        .eq("user_id", profile.id)
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (!error) setPortfolioImages(data || []);
      else setPortfolioImages([]);

      setLoadingPortfolio(false);
    };

    loadPortfolio();
  }, [profile]);

  // =========================
  // CATEGORÍAS AGRUPADAS
  // =========================
  const categoriasAgrupadas = useMemo(() => {
    const subs = Array.isArray(profile?.subcategorias)
      ? profile.subcategorias
      : [];
    if (subs.length === 0) return {};

    const out = {};

    const titleize = (str) =>
      String(str)
        .replace(/-/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    subs.forEach((raw) => {
      if (!raw.includes("::")) return;
      let [cat, sub] = raw.split("::");

      if (cat === "Fotografía & Video") {
        if (sub.startsWith("fotografia-")) cat = "Fotografía";
        if (sub.startsWith("video-")) cat = "Video";
      }

      sub = sub.replace(/^fotografia-|^video-/, "");
      if (!out[cat]) out[cat] = [];
      out[cat].push(titleize(sub));
    });

    Object.keys(out).forEach(
      (k) => (out[k] = [...new Set(out[k])])
    );

    return out;
  }, [profile?.subcategorias]);

  // =========================
  // ORDEN DE CATEGORÍAS
  // =========================
  const categorias = useMemo(() => {
    const keys = Object.keys(categoriasAgrupadas || {});
    const ordenadas = [];

    if (keys.includes("Fotografía")) ordenadas.push("Fotografía");
    if (keys.includes("Video")) ordenadas.push("Video");

    keys
      .filter((k) => k !== "Fotografía" && k !== "Video")
      .forEach((k) => ordenadas.push(k));

    return ordenadas;
  }, [categoriasAgrupadas]);

  // =========================
  // OFFSET HEADER
  // =========================
  useEffect(() => {
    function updateOffset() {
      const header = document.querySelector(".header");
      const categories = document.querySelector(".categories-bar");

      let total = 0;
      if (header) total += header.getBoundingClientRect().height;
      if (categories && !categories.classList.contains("hidden")) {
        total += categories.getBoundingClientRect().height;
      }

      setOffset(total + 12);
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    window.addEventListener("scroll", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset);
    };
  }, []);

  // =========================
  // ESTADOS BASE
  // =========================
  if (loading) return <p style={{ padding: 40 }}>Cargando perfil…</p>;
  if (!profile) return <p style={{ padding: 40 }}>Perfil no encontrado</p>;

  const isOwnProfile = user?.id === profile.id;
  const initial = profile.full_name?.charAt(0)?.toUpperCase() ?? "?";

  const whatsappUrl = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="main-content">
        <Header />

        <div
          className="feed-wrapper perfil-fullscreen"
          style={{ paddingTop: offset }}
        >
          <div className="perfil-card perfil-card-large">
            {/* ===== BANNER ===== */}
            <div className="perfil-banner">
              <div className="perfil-banner-default" />
            </div>

            {/* ===== HEADER ===== */}
            <div className="perfil-header-row">
              <div className="perfil-avatar-left">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" />
                ) : (
                  <div
                    className="avatar-placeholder"
                    style={{
                      backgroundColor: profile.avatar_color || "#E6E6FA",
                    }}
                  >
                    {initial}
                  </div>
                )}
              </div>

              <div
                className="perfil-header-info"
                style={{ position: "relative" }}
              >
                {!isOwnProfile && (
                  <div className="perfil-menu-wrapper">
                    <button
                      type="button"
                      className="perfil-menu-btn"
                      onClick={() => setOpenMenu((v) => !v)}
                    >
                      <MoreVertical size={24} />
                    </button>

                    {openMenu && (
                      <div className="perfil-menu-dropdown">
                        <button
                          type="button"
                          className="perfil-menu-item"
                          onClick={() => {
                            setOpenMenu(false);
                            navigate(`/denunciar/${profile.id}`);
                          }}
                        >
                          <Flag size={14} />
                          <span>Denunciar perfil</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h1 className="perfil-business perfil-business-large">
                  {profile.full_name}
                </h1>

                <div className="perfil-modalidad perfil-modalidad-large">
                  <span>
                    Ofrece servicios/productos de manera:&nbsp;
                    {profile.modalidad === "Online" && "🌐 Online"}
                    {profile.modalidad === "Presencial" && "🏢 Presencial"}
                    {profile.modalidad === "Ambos" &&
                      "🌐 Online y 🏢 Presencial"}
                  </span>
                </div>

                <p className="perfil-location perfil-location-large">
                  Dirección: 📍 {profile.localidad}, {profile.provincia}
                </p>

                {whatsappUrl && (
                  <button
                    type="button"
                    className="perfil-whatsapp-btn"
                    onClick={() => {
                      setOpenLegal(true);
                      setShowRealContact(false);
                    }}
                  >
                    Contactar por WhatsApp
                  </button>
                )}
              </div>
            </div>

            {/* ===== CATEGORÍAS Y SUBCATEGORÍAS ===== */}
            {categorias.length > 0 && (
              <div className="perfil-section-card perfil-section-large">
                <h3 className="perfil-section-title">
                  {categorias.length > 1 ? "Categorías" : "Categoría"}
                </h3>

                {categorias.map((cat) => (
                  <div
                    key={cat}
                    className="perfil-categoria-bloque"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "14px",
                    }}
                  >
                    <span className="perfil-categoria-title">{cat}:</span>

                    <div
                      className="perfil-subcategorias-grid"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {(categoriasAgrupadas[cat] || []).map((sub) => (
                        <span
                          key={`${cat}::${sub}`}
                          className="perfil-chip subcategoria"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== ENVÍOS ===== */}
            {profile.ofrece_envios !== null && (
              <div className="perfil-section-card perfil-section-large">
                <h3 className="perfil-section-title">
                  <Truck size={18} /> Envíos
                </h3>
                <p className="perfil-text-large">
                  {profile.ofrece_envios
                    ? "✔️ Ofrece envíos"
                    : "❌ No ofrece envíos"}
                </p>
              </div>
            )}

            {/* ===== DESCRIPCIÓN ===== */}
            {profile.descripcion && (
              <div className="perfil-section-card perfil-section-large">
                <h3 className="perfil-section-title">Descripción</h3>
                <p className="perfil-descripcion perfil-descripcion-large">
                  {profile.descripcion}
                </p>
              </div>
            )}

            {/* ===== PORTFOLIO ===== */}
            <div className="perfil-section-card perfil-section-large">
              <h2 className="perfil-portfolio-title perfil-portfolio-title-large">
                Portfolio
              </h2>

              {loadingPortfolio ? (
                <p style={{ marginTop: 12 }}>Cargando portfolio…</p>
              ) : portfolioImages.length === 0 ? (
                <p style={{ marginTop: 12, opacity: 0.8 }}>
                  Este usuario todavía no cargó imágenes en su portfolio.
                </p>
              ) : (
                <div className="perfil-portfolio-masonry">
                  {portfolioImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt="portfolio"
                      loading="lazy"
                      onClick={() => setActiveImage(img.image_url)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL LEGAL ===== */}
      <LegalModal
        open={openLegal}
        title="Aviso"
        confirmText={showRealContact ? "Cerrar" : "Aceptar"}
        onCancel={() => {
          setOpenLegal(false);
          setShowRealContact(false);
        }}
        onConfirm={() => {
          if (!showRealContact) {
            setShowRealContact(true);
          } else {
            setOpenLegal(false);
            setShowRealContact(false);
          }
        }}
        content={
          <>
            <p>
              La plataforma funciona únicamente como intermediaria y no verifica
              la identidad ni idoneidad de los usuarios.
            </p>
            <p>
              Los acuerdos y trabajos realizados son responsabilidad exclusiva
              entre las partes involucradas.
            </p>

            <a
              href="/terms"
              className="text-sm text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver términos y condiciones
            </a>

            {showRealContact && (
              <div style={{ marginTop: "16px" }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="perfil-whatsapp-btn"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            )}
          </>
        }
      />

      {activeImage && (
        <div className="perfil-lightbox" onClick={() => setActiveImage(null)}>
          <button className="perfil-lightbox-close">
            <X />
          </button>
          <img src={activeImage} alt="preview" />
        </div>
      )}
    </div>
  );
}

export default PerfilPublico;
