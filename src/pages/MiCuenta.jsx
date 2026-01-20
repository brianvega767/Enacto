import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastGlobal";
import { useRef, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "../App.css";

/* =====================================================
   COMPRESIÓN DE AVATAR (NO TOCAR)
   ===================================================== */
async function compressAvatarImage(file) {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("La imagen supera el límite de 2 MB");
  }

  const bitmap = await createImageBitmap(file);

  const MAX_SIZE = 512;
  let { width, height } = bitmap;

  if (width > height && width > MAX_SIZE) {
    height = Math.round((height * MAX_SIZE) / width);
    width = MAX_SIZE;
  } else if (height > MAX_SIZE) {
    width = Math.round((width * MAX_SIZE) / height);
    height = MAX_SIZE;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(
          new File([blob], "avatar.webp", {
            type: "image/webp",
          })
        );
      },
      "image/webp",
      0.9
    );
  });
}

function MiCuenta() {
  const navigate = useNavigate();
  const { user, profile, loading, syncSession } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] =
    useState(false);

  // ✅ FIX: si ya no está cargando y no hay sesión real, redirigimos.
  // (No hacemos signOut acá: eso se hace SOLO cuando el usuario lo pide)
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // ✅ FIX: loader SOLO cuando loading.
  // Antes: loading || !user, lo cual puede crear comportamientos raros si user cae a null temporalmente.
  if (loading) {
    return (
      <div className="account-overlay-light">
        <div className="account-panel">
          <p style={{ textAlign: "center", padding: "40px" }}>
            Cargando…
          </p>
        </div>
      </div>
    );
  }

  // ✅ FIX: si no hay user (sesión realmente ausente), ya redirigimos en el effect.
  // Evita render/loops.
  if (!user) return null;

  const esProfesional = profile?.is_professional === true;
  const esPremium = profile?.is_premium === true;

  /* ================== AVATAR (NO TOCAR) ================== */
  const handleAvatarClick = () => {
    if (subiendo) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setSubiendo(true);

    try {
      const file = await compressAvatarImage(originalFile);
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await syncSession();
      showToast("Avatar actualizado correctamente", "success");
    } catch (err) {
      showToast(
        err.message || "No se pudo actualizar la imagen",
        "error"
      );
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch {
      showToast("No se pudo cerrar sesión", "error");
    }
  };

  return (
    <>
      {/* ================= MODAL ELIMINAR CUENTA ================= */}
      {mostrarConfirmEliminar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                marginBottom: "12px",
                color: "#111",
                fontWeight: "600",
              }}
            >
              ¿Estás seguro que deseas eliminar tu cuenta?
            </h3>

            <p
              style={{
                marginBottom: "20px",
                color: "#444",
              }}
            >
              Esta acción es permanente y no se puede deshacer.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                className="account-btn"
                onClick={() => {
                  setMostrarConfirmEliminar(false);
                  showToast(
                    "Eliminar cuenta (pendiente de implementar)",
                    "info"
                  );
                }}
              >
                Sí, eliminar
              </button>

              <button
                className="account-btn"
                onClick={() =>
                  setMostrarConfirmEliminar(false)
                }
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="account-overlay-light">
        <div className="account-panel">
          {/* ================= AVATAR ================= */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.2rem",
            }}
          >
            <div
              onClick={handleAvatarClick}
              title="Cambiar avatar"
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                opacity: subiendo ? 0.6 : 1,
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#ddd",
                  }}
                />
              )}

              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✏️
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <h1 className="account-title">Mi cuenta</h1>

          <p className="account-subtitle">
            Administrá tu perfil y configuraciones.
          </p>

          <div className="account-info">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>

          {/* ================= USUARIO COMÚN ================= */}
          {!esProfesional && (
            <>
              <div className="account-actions">
                <button
                  className="account-btn"
                  onClick={() =>
                    navigate("/configuracion/email")
                  }
                >
                  Cambiar correo
                </button>

                <button
                  className="account-btn"
                  onClick={() =>
                    navigate("/configuracion/password")
                  }
                >
                  Cambiar contraseña
                </button>

                <button
                  className="account-btn"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>

                <button
                  className="account-btn"
                  onClick={() =>
                    setMostrarConfirmEliminar(true)
                  }
                >
                  Eliminar mi cuenta
                </button>
              </div>

              <div
                className="account-highlight"
                style={{ marginTop: "2.5rem" }}
              >
                <h3>🚀 ¿Querés ofrecer tus servicios?</h3>
                <p>
                  Creá tu cuenta profesional gratis y empezá
                  a recibir consultas reales.
                </p>
                <button
                  className="account-primary-btn"
                  onClick={() =>
                    navigate("/asistente-profesional/paso-1")
                  }
                >
                  Crear cuenta profesional
                </button>
              </div>
            </>
          )}

          {/* ================= PROFESIONAL ================= */}
          {esProfesional && (
            <>
             <h3
               style={{
                marginTop: "2rem",
                marginBottom: "1.2rem",
                textAlign: "center",
                color: "#222",
                fontWeight: "600",
              }}
            >
               Perfil profesional
            </h3>

              <div className="account-actions">
                <button
                  className="account-btn"
                  onClick={() => navigate("/configuracion")}
                >
                  Configuraciones
                </button>
                <button
                  className="account-btn"
                  onClick={() =>
                    navigate(`/perfil/${profile.slug}`)
                  }
                >
                  Ver mi perfil público
                </button>
                <button
                  className="account-btn"
                  onClick={() => navigate("/editar-perfil")}
                >
                  Editar perfil profesional
                </button>
                <button
                  className="account-btn"
                  onClick={() =>
                    navigate(
                      "/asistente-profesional/paso-4"
                    )
                  }
                >
                  Editar portfolio
                </button>
              </div>
            </>
          )}

          {/* ================= CTA PREMIUM ================= */}
          {esProfesional && !esPremium && (
            <div
              className="account-highlight premium"
              style={{ marginTop: "2.5rem" }}
            >
              <h3>⭐ Potenciá tu perfil</h3>
              <p>
                Pasate a premium y desbloqueá más visibilidad.
              </p>
              <button
                className="account-primary-btn premium"
                onClick={() => navigate("/premium")}
              >
                Hacete Premium
              </button>
            </div>
          )}

          <button
            className="account-back"
            onClick={() => navigate("/")}
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </>
  );
}

export default MiCuenta;
