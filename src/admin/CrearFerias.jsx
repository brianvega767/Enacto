import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./CrearFerias.css";

export default function CrearFerias() {
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ==============================
     🔽 Compresión de imágenes
     ============================== */
  const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo comprimir la imagen"));
              return;
            }
            resolve(
              new File([blob], file.name, { type: file.type })
            );
          },
          file.type,
          quality
        );
      };

      reader.onerror = () =>
        reject(new Error("Error leyendo la imagen"));
      reader.readAsDataURL(file);
    });
  };

  /* ==============================
     ☁️ Upload a Supabase Storage
     ============================== */
  const uploadImage = async (file, folder, feriaId) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const sizeMB = file.size / (1024 * 1024);

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Formato no permitido. Usá JPG, PNG o WEBP."
      );
    }

    if (sizeMB > 7) {
      throw new Error(
        "La imagen supera el tamaño máximo de 7 MB."
      );
    }

    let finalFile = file;

    // 🔽 Comprimir si pesa más de 2 MB
    if (sizeMB > 2) {
      finalFile = await compressImage(file);
    }

    const ext = finalFile.name.split(".").pop().toLowerCase();
    const path = `${folder}/${feriaId}.${ext}`;

    const { error } = await supabase.storage
      .from("ferias")
      .upload(path, finalFile, {
        upsert: true,
        contentType: finalFile.type,
        cacheControl: "3600",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("ferias")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  /* ==============================
     🚀 Submit
     ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1️⃣ Crear feria sin imágenes
      const { data, error: insertError } = await supabase
        .from("ferias")
        .insert([
          {
            nombre: form.nombre,
            descripcion: form.descripcion,
            fecha: form.fecha,
            hora: form.hora,
            whatsapp_phone: form.whatsapp_phone,
            is_active: form.is_active,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const feriaId = data.id;

      // 2️⃣ Subir imágenes
      let bannerUrl = null;
      let logoUrl = null;

      if (bannerFile) {
        bannerUrl = await uploadImage(
          bannerFile,
          "banners",
          feriaId
        );
      }

      if (logoFile) {
        logoUrl = await uploadImage(
          logoFile,
          "logos",
          feriaId
        );
      }

      // 3️⃣ Guardar URLs
      if (bannerUrl || logoUrl) {
        await supabase
          .from("ferias")
          .update({
            banner_url: bannerUrl,
            logo_url: logoUrl,
          })
          .eq("id", feriaId);
      }

      setSuccess(true);
      setForm({
        nombre: "",
        descripcion: "",
        fecha: "",
        hora: "",
        whatsapp_phone: "",
        is_active: true,
      });
      setBannerFile(null);
      setLogoFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al publicar la feria");
    }

    setLoading(false);
  };

  return (
    <div className="crear-ferias-page">
      <h1 className="crear-ferias-title">Publicar nueva feria</h1>

      <form className="crear-ferias-form" onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label>Descripción del evento</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label>WhatsApp de contacto</label>
          <input
            type="text"
            name="whatsapp_phone"
            value={form.whatsapp_phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Banner</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setBannerFile(e.target.files[0])
              }
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setLogoFile(e.target.files[0])
              }
            />
          </div>
        </div>

        <div className="form-checkbox">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <label>Publicar inmediatamente</label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success">
            ✅ Feria publicada correctamente
          </p>
        )}

        <button
          type="submit"
          className="form-submit"
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar Feria"}
        </button>
      </form>
    </div>
  );
}
