import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CrearFerias.css"; // reutilizamos estilos

export default function EditarFeria() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora: "",
    whatsapp_phone: "",
    is_active: true,
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /* =====================
     CARGAR FERIA
     ===================== */

  useEffect(() => {
    const fetchFeria = async () => {
      const { data, error } = await supabase
        .from("ferias")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("No se pudo cargar la feria");
        setLoading(false);
        return;
      }

      setForm({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: data.fecha,
        hora: data.hora,
        whatsapp_phone: data.whatsapp_phone,
        is_active: data.is_active,
      });

      setBannerPreview(data.banner_url);
      setLogoPreview(data.logo_url);

      setLoading(false);
    };

    fetchFeria();
  }, [id]);

  /* =====================
     HANDLERS
     ===================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBannerChange = (file) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleLogoChange = (file) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* =====================
     SUBIR IMÁGENES
     ===================== */

  const uploadImage = async (file, folder) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${id}.${ext}`;

    const { error } = await supabase.storage
      .from("ferias")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("ferias")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  /* =====================
     GUARDAR CAMBIOS
     ===================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let bannerUrl = bannerPreview;
      let logoUrl = logoPreview;

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, "banners");
      }

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, "logos");
      }

      const { error } = await supabase
        .from("ferias")
        .update({
          ...form,
          banner_url: bannerUrl,
          logo_url: logoUrl,
        })
        .eq("id", id);

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Error guardando los cambios");
    }

    setSaving(false);
  };

  /* =====================
     RENDER
     ===================== */

  if (loading) {
    return <p>Cargando feria…</p>;
  }

  return (
    <div className="crear-ferias-page">
      <h1 className="crear-ferias-title">Editar Feria</h1>

      <form className="crear-ferias-form" onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="form-group">
          <label>Nombre del evento</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha / Hora */}
        <div className="form-row">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora</label>
            <input
              type="text"
              name="hora"
              value={form.hora}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        {/* WhatsApp */}
        <div className="form-group">
          <label>WhatsApp</label>
          <input
            type="text"
            name="whatsapp_phone"
            value={form.whatsapp_phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* Imágenes */}
        <div className="form-row">
          <div className="form-group">
            <label>Banner</label>
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Banner preview"
                style={{ width: "100%", borderRadius: 8, marginBottom: 10 }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleBannerChange(e.target.files[0])
              }
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                style={{ width: 120, borderRadius: "50%", marginBottom: 10 }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleLogoChange(e.target.files[0])
              }
            />
          </div>
        </div>

        {/* Activa */}
        <div className="form-checkbox">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <label>Feria activa</label>
        </div>

        {/* Feedback */}
        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success">
            ✅ Cambios guardados correctamente
          </p>
        )}

        {/* Acciones */}
        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="submit"
            className="form-submit"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/ferias")}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
