import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/ToastGlobal";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import "../../App.css";

const generarSlug = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function AsistentePaso3() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const yaNavegoRef = useRef(false);

  const [perfilTipo, setPerfilTipo] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [previewFoto, setPreviewFoto] = useState(null);

  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    modalidad: "",
    ofreceEnvios: null,
    provincia: "",
    localidad: "",
    foto: null,
    whatsapp: "",
  });

  // =========================
  // CARGAR DRAFT
  // =========================
  useEffect(() => {
    const cargarDraft = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("profile_drafts")
        .select("perfil_tipo, categorias, subcategorias")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) return;

      setPerfilTipo(data.perfil_tipo);
      setCategorias(data.categorias || []);
      setSubcategorias(data.subcategorias || []);
    };

    cargarDraft();
  }, [user?.id]);

  const mostrarEnvios = perfilTipo === "productos" || perfilTipo === "ambos";

  // =========================
  // CARGAR PROVINCIAS
  // =========================
  useEffect(() => {
    async function loadProvincias() {
      const { data } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

      setProvincias(data || []);
    }

    loadProvincias();
  }, []);

  // =========================
  // CARGAR LOCALIDADES
  // =========================
  useEffect(() => {
    if (!form.provincia) {
      setLocalidades([]);
      return;
    }

    async function loadLocalidades() {
      const { data } = await supabase
        .from("cities")
        .select("id, name")
        .eq("province_id", form.provincia)
        .order("name")
        .range(0, 10000);

      setLocalidades(data || []);
    }

    loadLocalidades();
  }, [form.provincia]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "foto") {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, foto: file }));
      setPreviewFoto(file ? URL.createObjectURL(file) : null);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const puedeContinuar = () =>
    form.nombre.trim() &&
    form.modalidad &&
    form.provincia &&
    form.localidad &&
    form.whatsapp.trim() &&
    (!mostrarEnvios || form.ofreceEnvios !== null);

  // =========================
  // CONTINUAR
  // =========================
  const continuar = async () => {
    if (yaNavegoRef.current) return;

    showToast("Guardando...");

    if (!user?.id) {
      showToast("Sesión inválida.");
      return;
    }

    if (!puedeContinuar()) {
      showToast("Completá todos los campos obligatorios.");
      return;
    }

    const slug = generarSlug(form.nombre);
    let avatarUrl = null;

    try {
      if (form.foto) {
        const filePath = `${user.id}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, form.foto, {
            upsert: true,
            contentType: form.foto.type,
          });

        if (uploadError) {
          showToast("Error al subir la imagen.");
          return;
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatarUrl = data.publicUrl;
      }

      const provinciaNombre =
        provincias.find((p) => String(p.id) === String(form.provincia))?.name ||
        null;

      const localidadNombre =
        localidades.find((l) => String(l.id) === String(form.localidad))?.name ||
        null;

      const payload = {
        id: user.id,
        full_name: form.nombre,
        descripcion: form.descripcion,
        modalidad: form.modalidad,
        provincia: provinciaNombre,
        localidad: localidadNombre,
        whatsapp: form.whatsapp,
        ofrece_envios: mostrarEnvios ? form.ofreceEnvios : false,
        categorias,
        subcategorias,
        is_professional: true,
        status: "active",
        slug,
        avatar_url: avatarUrl,
      };

      // 🔥 FIX REAL: upsert + select explícito
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("UPSERT ERROR:", error);
        showToast("No se pudo guardar el perfil.");
        return;
      }

      await supabase.from("profile_drafts").delete().eq("user_id", user.id);

      yaNavegoRef.current = true;

      navigate("/asistente-profesional/intermedio-portfolio", {
        replace: true,
      });
    } catch (e) {
      console.error(e);
      showToast("Error inesperado al guardar.");
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="asistente-page asistente-bg-ultra asistente-fixed asistente-paso3">
      <h1 className="asistente-title">Paso 3 · Datos del perfil</h1>

      <div className="asistente-card-form ultra-card asistente-compact asistente-paso3-card">
        <div className="asistente-form-col">
          <div className="asistente-form-section">
            <h4>Identidad</h4>
            <input
              name="nombre"
              placeholder="Nombre real o marca *"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="asistente-form-section">
            <h4>
              Descripción breve{" "}
              <span className="asistente-optional">(opcional)</span>
            </h4>
            <textarea
              name="descripcion"
              maxLength={200}
              placeholder="Contá brevemente qué ofrecés"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="asistente-form-section">
            <h4>Modalidad</h4>
            <select
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
            >
              <option value="">Elegí modalidad *</option>
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          {mostrarEnvios && (
            <div className="asistente-form-section">
              <h4>Envíos</h4>
              <select
                value={form.ofreceEnvios ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ofreceEnvios: e.target.value === "true",
                  }))
                }
              >
                <option value="">¿Ofrecés envíos? *</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          )}
        </div>

        <div className="asistente-form-col">
          <div className="asistente-form-section">
            <h4>Ubicación</h4>

            <select
              name="provincia"
              value={form.provincia}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  provincia: e.target.value,
                  localidad: "",
                }))
              }
            >
              <option value="">Provincia *</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {form.provincia && (
              <select
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
              >
                <option value="">Localidad *</option>
                {localidades.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="asistente-form-section">
            <h4>
              Foto o logo{" "}
              <span className="asistente-optional">(opcional)</span>
            </h4>
            <div className="perfil-upload-box-dark compact">
              <div className="perfil-avatar-preview small">
                {previewFoto ? (
                  <img src={previewFoto} alt="preview" />
                ) : (
                  <span>Imagen</span>
                )}
              </div>
              <label className="perfil-upload-btn-visible upload-light">
                Seleccionar imagen
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  hidden
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="asistente-form-section">
            <h4>WhatsApp</h4>
            <input
              name="whatsapp"
              placeholder="Número de WhatsApp *"
              value={form.whatsapp}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="asistente-footer">
        <button
          type="button"
          className={`asistente-btn ${puedeContinuar() ? "enabled" : ""}`}
          onClick={continuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default AsistentePaso3;
