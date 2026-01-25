import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { createPortal } from "react-dom";
import "./DenunciarPerfil.css";

const MAX_CHARS = 300;

function DenunciarPerfil() {
  const { user } = useAuth();
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 🔒 Bloquear scroll del body (overlay real)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // =========================
  // CARGAR PERFIL
  // =========================
  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", profileId)
        .single();

      if (!error) setProfile(data || null);
      setLoading(false);
    };

    loadProfile();
  }, [profileId]);

  if (!user) {
    return createPortal(
      <p style={{ padding: 40 }}>
        Debés iniciar sesión para denunciar un perfil.
      </p>,
      document.body
    );
  }

  if (loading) {
    return createPortal(
      <p style={{ padding: 40 }}>Cargando…</p>,
      document.body
    );
  }

  if (!profile) {
    return createPortal(
      <p style={{ padding: 40 }}>Perfil no encontrado.</p>,
      document.body
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!reason) {
      setError("Seleccioná un motivo.");
      return;
    }

    if (description.length > MAX_CHARS) {
      setError("El texto supera el límite permitido.");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("account_reports").insert({
      reporter_user_id: user.id,
      reported_profile_id: profile.id,
      reason,
      description,
    });

    if (error) {
      if (error.code === "23505") {
        setError("Ya denunciaste este perfil anteriormente.");
      } else {
        setError("Ocurrió un error al enviar la denuncia.");
      }
      setSending(false);
      return;
    }

    setSuccess(true);
    setSending(false);
  };

  return createPortal(
    <div className="denuncia-wrapper">
      <div className="denuncia-card">
        <h1>Denunciar perfil</h1>

        <p className="denuncia-subtitle">
          Estás denunciando el perfil de:
        </p>

        <strong className="denuncia-profile-name">
          {profile.full_name}
        </strong>

        {success ? (
          <>
            <p className="denuncia-success">
              Gracias. El administrador revisará tu denuncia y tomará las
              medidas necesarias.
            </p>

            <button
              className="denuncia-btn"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Motivo *
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Seleccionar motivo</option>
                <option value="Estafa">Estafa</option>
                <option value="Incumplimiento">Incumplimiento</option>
                <option value="Mal trato">Mal trato</option>
                <option value="Perfil falso">Perfil falso</option>
                <option value="Otro">Otro</option>
              </select>
            </label>

            <label>
              Contanos qué pasó (opcional)
              <textarea
                rows={5}
                value={description}
                maxLength={MAX_CHARS}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describí brevemente la situación. Máximo 300 caracteres."
              />
              <div className="denuncia-counter">
                {description.length} / {MAX_CHARS}
              </div>
            </label>

            {error && (
              <p className="denuncia-error">{error}</p>
            )}

            <div className="denuncia-actions">
              <button
                type="button"
                className="denuncia-btn secondary"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="denuncia-btn"
                disabled={sending}
              >
                {sending ? "Enviando…" : "Enviar denuncia"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

export default DenunciarPerfil;
