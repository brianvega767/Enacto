import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./CrearColaborador.css";

export default function CrearColaborador() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    busca_categoria: "",
    tipo_colaboracion: "",
    descripcion: "",
    instagram_url: "",
    whatsapp_phone: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const uploadAvatar = async (file, colaboradorId) => {
    const path = `colaborador-${colaboradorId}`;

    const { error } = await supabase.storage
      .from("ferias")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("ferias")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError("Debés estar logueado para publicar.");
      setLoading(false);
      return;
    }

    try {
      // 🔒 1️⃣ CHEQUEAR LÍMITE
      const { count, error: countError } = await supabase
        .from("colaboradores")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;

      if (count >= 2) {
        setShowLimitModal(true);
        setLoading(false);
        return;
      }
       await supabase.rpc("limpiar_colaboradores_vencidos");

      // ✅ 2️⃣ CREAR PUBLICACIÓN
      const { data, error: insertError } = await supabase
        .from("colaboradores")
        .insert({
          user_id: user.id,
          ...form,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 🖼️ 3️⃣ SUBIR AVATAR
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(
          avatarFile,
          data.id
        );

        await supabase
          .from("colaboradores")
          .update({ avatar_url: avatarUrl })
          .eq("id", data.id);
      }

      setShowSuccessModal(true);

      setForm({
        nombre: "",
        categoria: "",
        busca_categoria: "",
        tipo_colaboracion: "",
        descripcion: "",
        instagram_url: "",
        whatsapp_phone: "",
      });
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
      setError(
        "Ocurrió un error al publicar. Revisá los datos."
      );
    }

    setLoading(false);
  };

  return (
    <div className="crear-colab-layout">
      <div className="crear-colab-card">
        <button
          className="crear-colab-back"
          onClick={() => navigate(-1)}
        >
          ← Volver atrás
        </button>

        <h1 className="crear-colab-title">Buscar Colaborador</h1>

        <p className="crear-colab-subtitle">
          Publicá una búsqueda para encontrar otros emprendedores
          con los que puedas colaborar y crecer en conjunto.
        </p>

        <form className="crear-colab-form" onSubmit={handleSubmit}>
          {/* AVATAR */}
          <div className="form-group">
            <label>Logo / Avatar</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>Nombre del emprendimiento</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>¿De qué es tu emprendimiento?</label>
            <input
              type="text"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>¿Con quién querés colaborar?</label>
            <input
              type="text"
              name="busca_categoria"
              value={form.busca_categoria}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de colaboración</label>
            <select
              name="tipo_colaboracion"
              value={form.tipo_colaboracion}
              onChange={handleChange}
              required
            >
              <option value="">Seleccioná una opción</option>
              <option value="Sorteo conjunto">Sorteo conjunto</option>
              <option value="Promoción cruzada">Promoción cruzada</option>
              <option value="Compartir stand en feria">Compartir stand</option>
              <option value="Contenido colaborativo">Contenido colaborativo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>WhatsApp (obligatorio)</label>
            <input
              type="text"
              name="whatsapp_phone"
              value={form.whatsapp_phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Instagram (opcional)</label>
            <input
              type="url"
              name="instagram_url"
              value={form.instagram_url}
              onChange={handleChange}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="form-submit"
            disabled={loading}
          >
            {loading ? "Publicando..." : "Publicar búsqueda"}
          </button>
        </form>
      </div>

      {/* MODAL LÍMITE */}
      {showLimitModal && (
        <div className="colab-modal-overlay">
          <div className="colab-modal">
            <h2>Límite de publicaciones alcanzado</h2>

            <p className="modal-text">
              Actualmente tenés <strong>2 publicaciones activas</strong>.
              <br /><br />
              Para crear una nueva búsqueda, necesitás esperar a que
              una publicación venza automáticamente o eliminar una
              existente desde <strong>Mis publicaciones</strong>.
            </p>

            <button
              className="modal-button"
              onClick={() => setShowLimitModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO */}
      {showSuccessModal && (
        <div className="colab-modal-overlay">
          <div className="colab-modal">
            <h2>Publicación creada</h2>

            <p className="modal-text">
              Tu búsqueda estará visible durante <strong>10 días</strong>.
              <br /><br />
              Una vez que consigas colaborador, te recomendamos
              eliminar la publicación para mantener la herramienta ordenada.
            </p>

            <button
              className="modal-button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/herramientas/colaboradores");
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
