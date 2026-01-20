import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Pencil, Truck } from "lucide-react";
import "../App.css";
import "../profile/PerfilPublico.css";

function EditarPerfilPublico() {
  const navigate = useNavigate();
  const { user, profile: authProfile, loading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [offset, setOffset] = useState(0);

  /* ================= SEGURIDAD ================= */
  useEffect(() => {
    if (!loading && (!user || !authProfile?.is_professional)) {
      navigate("/mi-cuenta");
    }
  }, [loading, user, authProfile, navigate]);

  /* ================= CARGAR PERFIL ================= */
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setForm(data);
    };

    loadProfile();
  }, [user]);

  /* ================= OFFSET HEADER ================= */
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

  /* ================= GUARDAR CAMPO ================= */
  const saveField = async (field) => {
    await supabase
      .from("profiles")
      .update({ [field]: form[field] })
      .eq("id", user.id);

    setProfile({ ...profile, [field]: form[field] });
    setEditing(null);
  };

  /* ================= CATEGORÍAS AGRUPADAS ================= */
  const categoriasAgrupadas = useMemo(() => {
    const map = {};

    (profile?.subcategorias || []).forEach((item) => {
      const [cat, sub] = item.split("::");
      if (!cat || !sub) return;

      const categoria = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (!map[categoria]) map[categoria] = [];
      map[categoria].push(sub);
    });

    return map;
  }, [profile]);

  const categorias = Object.keys(categoriasAgrupadas);

  if (!profile) return null;

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
              <div
                className="perfil-avatar-left"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/mi-cuenta")}
                title="Editar avatar"
              >
                <img
                  src={profile.avatar_url || "https://via.placeholder.com/300"}
                  alt="avatar"
                />
              </div>

              <div className="perfil-header-info">

                {/* ===== NOMBRE ===== */}
                {editing === "full_name" ? (
                  <>
                    <input
                      value={form.full_name || ""}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveField("full_name")}>Guardar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <h1 className="perfil-business perfil-business-large">
                    {profile.full_name}
                    <Pencil size={16} onClick={() => setEditing("full_name")} />
                  </h1>
                )}

                {/* ===== MODALIDAD ===== */}
                {editing === "modalidad" ? (
                  <>
                    <select
                      value={form.modalidad}
                      onChange={(e) =>
                        setForm({ ...form, modalidad: e.target.value })
                      }
                    >
                      <option value="Online">Online</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={() => saveField("modalidad")}>Guardar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <div className="perfil-modalidad perfil-modalidad-large">
                    <span>
                      Ofrece servicios/productos de manera:&nbsp;
                      {profile.modalidad === "Online" && "🌐 Online"}
                      {profile.modalidad === "Presencial" && "🏢 Presencial"}
                      {profile.modalidad === "Ambos" &&
                        "🌐 Online y 🏢 Presencial"}
                    </span>
                    <Pencil size={14} onClick={() => setEditing("modalidad")} />
                  </div>
                )}

                {/* ===== UBICACIÓN ===== */}
                {editing === "ubicacion" ? (
                  <>
                    <input
                      placeholder="Localidad"
                      value={form.localidad || ""}
                      onChange={(e) =>
                        setForm({ ...form, localidad: e.target.value })
                      }
                    />
                    <input
                      placeholder="Provincia"
                      value={form.provincia || ""}
                      onChange={(e) =>
                        setForm({ ...form, provincia: e.target.value })
                      }
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveField("provincia")}>Guardar</button>
                      <button onClick={() => setEditing(null)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <p className="perfil-location perfil-location-large">
                    Dirección: 📍 {profile.localidad}, {profile.provincia}
                    <Pencil size={14} onClick={() => setEditing("ubicacion")} />
                  </p>
                )}

              </div>
            </div>

            {/* ===== CATEGORÍAS ===== */}
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
                      {categoriasAgrupadas[cat].map((sub) => (
                        <span key={sub} className="perfil-chip subcategoria">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="perfil-edit-link"
                  onClick={() =>
                    navigate("/asistente-profesional/paso-1?mode=edit")
                  }
                >
                  <Pencil size={14} />
                  Editar categoría y subcategorías
                </button>
              </div>
            )}

            {/* ===== ENVÍOS ===== */}
            <div className="perfil-section-card perfil-section-large">
              <h3 className="perfil-section-title">
                <Truck size={18} /> Envíos
                <Pencil size={14} onClick={() => setEditing("envios")} />
              </h3>

              {editing === "envios" ? (
                <>
                  <select
                    value={form.ofrece_envios ? "si" : "no"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ofrece_envios: e.target.value === "si",
                      })
                    }
                  >
                    <option value="si">✔️ Ofrece envíos</option>
                    <option value="no">❌ No ofrece envíos</option>
                  </select>
                  <div className="edit-actions">
                    <button onClick={() => saveField("ofrece_envios")}>Guardar</button>
                    <button onClick={() => setEditing(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <p className="perfil-text-large">
                  {profile.ofrece_envios
                    ? "✔️ Ofrece envíos"
                    : "❌ No ofrece envíos"}
                </p>
              )}
            </div>

            {/* ===== DESCRIPCIÓN ===== */}
            <div className="perfil-section-card perfil-section-large">
              <h3 className="perfil-section-title">
                Descripción
                <Pencil size={14} onClick={() => setEditing("descripcion")} />
              </h3>

              {editing === "descripcion" ? (
                <>
                  {/* ✅ CAMBIO MÍNIMO: wrapper con clase + textarea más grande + contador superpuesto */}
                  <div className="descripcion-wrapper">
                    <textarea
                      className="perfil-descripcion perfil-descripcion-large descripcion-textarea"
                      value={form.descripcion || ""}
                      maxLength={300}
                      onChange={(e) =>
                        setForm({ ...form, descripcion: e.target.value })
                      }
                      placeholder="Contá brevemente qué ofrecés, cómo trabajás y qué te diferencia…"
                    />
                    <span className="descripcion-counter">
                      {(form.descripcion?.length || 0)}/300
                    </span>
                  </div>

                  <div className="edit-actions">
                    <button onClick={() => saveField("descripcion")}>Guardar</button>
                    <button onClick={() => setEditing(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <p
                  className="perfil-descripcion perfil-descripcion-large"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {profile.descripcion || "Sin descripción"}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarPerfilPublico;
