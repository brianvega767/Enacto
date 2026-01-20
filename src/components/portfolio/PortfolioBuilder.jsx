import { useState, useEffect, useRef } from "react";
import "./PortfolioBuilder.css";

const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const MAX_DIMENSION = 2000;

// =========================
// OPTIMIZAR IMAGEN (2 MB)
// =========================
async function optimizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;

      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const qualities = [0.9, 0.85, 0.8, 0.75];

      const intentar = (i) => {
        if (i >= qualities.length) return reject();

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject();
            if (blob.size <= MAX_BYTES) {
              resolve(
                new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                  type: "image/jpeg",
                })
              );
            } else {
              intentar(i + 1);
            }
          },
          "image/jpeg",
          qualities[i]
        );
      };

      intentar(0);
    };

    img.onerror = reject;
    img.src = url;
  });
}

// =========================
// ORIENTACIÓN
// =========================
function detectarOrientacion(img) {
  if (img.height > img.width) return "vertical";
  if (img.width > img.height * 2) return "panoramica";
  if (img.width > img.height) return "horizontal";
  return "cuadrada";
}

function PortfolioBuilder({ esPremium = false, supabase, userId }) {
  const maxFotos = esPremium ? 20 : 7;

  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const loadedRef = useRef(false);

  // ✅ Modal Premium
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const trayImages = images.filter((i) => i && !i.enPortfolio);
  const portfolioImages = images.filter((i) => i && i.enPortfolio);

  // 🔒 SOLO VISIBLES SEGÚN PLAN (BLINDADO)
  const visibles = portfolioImages
    .filter((i) => i && i.id && i.url)
    .slice(0, maxFotos);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // =========================
  // CARGAR EXISTENTES
  // =========================
  useEffect(() => {
    if (!supabase || !userId) return;

    const cargar = async () => {
      const { data } = await supabase
        .from("portfolio_images")
        .select("id, image_url, position")
        .eq("user_id", userId)
        .order("position");

      if (!data) return;

      setImages(
        data.map((img) => ({
          id: img.id,
          url: img.image_url,
          enPortfolio: true,
          columnSpan: 1,
        }))
      );

      loadedRef.current = true;
    };

    cargar();
  }, [supabase, userId]);

  // =========================
  // GUARDAR ORDEN
  // =========================
  useEffect(() => {
    if (!loadedRef.current) return;

    visibles.forEach((img, index) => {
      supabase.from("portfolio_images").update({ position: index }).eq("id", img.id);
    });
  }, [visibles, supabase]);

  // =========================
  // SUBIR → BANDEJA
  // =========================
  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // ✅ BLOQUEO PREMIUM: si no es premium y ya llegó a 7, mostrar modal
    if (!esPremium && visibles.length >= maxFotos) {
      setShowPremiumModal(true);
      e.target.value = "";
      return;
    }

    // ✅ Si el usuario selecciona varias imágenes, cortar en el límite permitido
    const cupoDisponible = Math.max(0, maxFotos - visibles.length);
    const filesToProcess =
      !esPremium && files.length > cupoDisponible ? files.slice(0, cupoDisponible) : files;

    // Si recortamos por cupo, mostramos el modal premium
    if (!esPremium && files.length > filesToProcess.length) {
      setShowPremiumModal(true);
    }

    for (const file of filesToProcess) {
      let finalFile;
      try {
        finalFile = await optimizeImage(file);
      } catch {
        mostrarToast("No se pudo reducir la imagen a 2 MB");
        continue;
      }

      const localUrl = URL.createObjectURL(finalFile);
      const imgObj = new Image();
      imgObj.src = localUrl;
      await new Promise((r) => (imgObj.onload = r));

      const orient = detectarOrientacion(imgObj);
      let columnSpan = 1;
      if (orient === "horizontal") columnSpan = 2;
      if (orient === "panoramica") columnSpan = 3;

      const path = `${userId}/${Date.now()}-${crypto.randomUUID()}`;
      await supabase.storage.from("portfolio").upload(path, finalFile);

      const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);

      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: pub.publicUrl,
          enPortfolio: false,
          columnSpan,
          storagePath: path,
        },
      ]);
    }

    e.target.value = "";
  };

  // =========================
  // DRAG & DROP
  // =========================
  const handleDragStart = (id) => setDraggingId(id);
  const permitirDrop = (e) => e.preventDefault();

  const colocarEnPortfolio = async () => {
    if (visibles.length >= maxFotos) {
      if (!esPremium) setShowPremiumModal(true);
      else {
        mostrarToast("Máximo 20 imágenes en el portfolio");
      }
      return;
    }

    const img = images.find((i) => i && i.id === draggingId);
    if (!img || img.enPortfolio) return;

    const { data, error } = await supabase
      .from("portfolio_images")
      .insert({
        user_id: userId,
        image_url: img.url,
        position: visibles.length,
      })
      .select()
      .single();

    if (!data || error) {
      mostrarToast("No se pudo agregar la imagen al portfolio");
      return;
    }

    setImages((prev) =>
      prev.map((i) =>
        i && i.id === draggingId ? { ...i, id: data.id, enPortfolio: true } : i
      )
    );
  };

  const devolverABandeja = async () => {
    const img = images.find((i) => i && i.id === draggingId);
    if (!img || !img.enPortfolio) return;

    await supabase.from("portfolio_images").delete().eq("id", img.id);

    setImages((prev) => prev.map((i) => (i && i.id === draggingId ? { ...i, enPortfolio: false } : i)));
  };

  const eliminarImagen = async () => {
    const img = images.find((i) => i && i.id === draggingId);
    if (!img) return;

    if (img.enPortfolio) {
      await supabase.from("portfolio_images").delete().eq("id", img.id);
    }

    if (img.storagePath) {
      await supabase.storage.from("portfolio").remove([img.storagePath]);
    }

    setImages((prev) => prev.filter((i) => i && i.id !== draggingId));
  };

  return (
    <div className="portfolio-builder">
      {/* ✅ MODAL PREMIUM (FONDO BORROSO + X) */}
      {showPremiumModal && !esPremium && (
        <div
          className="premium-modal-overlay"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="premium-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="premium-modal-close"
              onClick={() => setShowPremiumModal(false)}
              aria-label="Cerrar"
              type="button"
            >
              ✕
            </button>

            <h3 className="premium-modal-title">🔓 Desbloqueá todo el potencial de tu portfolio</h3>

            <p className="premium-modal-text">
              Actualmente tu plan permite publicar hasta <b>7 imágenes.</b>
              <br />
              Con <b>Premium</b> podes mostrar hasta <b>20 imágenes</b> en tu portfolio, destacar tu perfil y acceder a herramientas pensadas para crecer y vender más.
            </p>

            <button
              className="premium-modal-cta"
              type="button"
              onClick={() => {
                window.location.href = "/premium";
              }}
            >
              Ver plan Premium
            </button>
          </div>
        </div>
      )}

      {!esPremium && portfolioImages.length > maxFotos && (
        <div className="portfolio-upgrade-hint">
          <strong>Plan gratuito:</strong> solo se muestran <b>7 imágenes</b>. Volvé a{" "}
          <b>Premium</b> para mostrar todo tu portfolio.
        </div>
      )}

      <div className="portfolio-controls">
        <label className="portfolio-upload-btn">
          Subir imágenes
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleFileInput}
          />
        </label>

        <span className="portfolio-count">
          {visibles.length} / {maxFotos}
        </span>

        <div
          className="portfolio-trash"
          onDragOver={permitirDrop}
          onDrop={eliminarImagen}
        >
          🗑 Eliminar
        </div>
      </div>

      <div className="portfolio-tray" onDragOver={permitirDrop} onDrop={devolverABandeja}>
        <div className="tray-header">Bandeja</div>

        <div className="tray-content">
          {trayImages.map((img) => (
            <img
              key={img.id}
              src={img.url}
              className="tray-item"
              draggable
              onDragStart={() => handleDragStart(img.id)}
              alt=""
            />
          ))}
        </div>
      </div>

      <div
        className={esPremium ? "portfolio-masonry" : "portfolio-uniform"}
        onDragOver={permitirDrop}
        onDrop={colocarEnPortfolio}
      >
        {visibles.length === 0 && (
          <div className="portfolio-drop-placeholder">
            Arrastrá tus imágenes acá para comenzar ✨
          </div>
        )}

        {visibles.map((img) =>
          esPremium ? (
            <div
              key={img.id}
              className={`masonry-item col-${img.columnSpan}`}
              draggable
              onDragStart={() => handleDragStart(img.id)}
            >
              <img src={img.url} alt="" />
            </div>
          ) : (
            <div
              key={img.id}
              className="uniform-item"
              draggable
              onDragStart={() => handleDragStart(img.id)}
            >
              <img src={img.url} alt="" />
            </div>
          )
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default PortfolioBuilder;
