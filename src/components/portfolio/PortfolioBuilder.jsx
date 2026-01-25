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
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const loadedRef = useRef(false);

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const trayImages = images.filter((i) => i && !i.enPortfolio);
  const portfolioImages = images.filter((i) => i && i.enPortfolio);

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
      supabase
        .from("portfolio_images")
        .update({ position: index })
        .eq("id", img.id);
    });
  }, [visibles, supabase]);

  // =========================
  // SUBIR → BANDEJA
  // =========================
  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!esPremium && visibles.length >= maxFotos) {
      setShowPremiumModal(true);
      e.target.value = "";
      return;
    }

    const cupoDisponible = Math.max(0, maxFotos - visibles.length);
    const filesToProcess =
      !esPremium && files.length > cupoDisponible
        ? files.slice(0, cupoDisponible)
        : files;

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

      const { data: pub } = supabase.storage
        .from("portfolio")
        .getPublicUrl(path);

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
  // DRAG & DROP / ACCIONES
  // =========================
  const handleDragStart = (id) => setDraggingId(id);
  const permitirDrop = (e) => e.preventDefault();

  const colocarEnPortfolio = async () => {
    if (visibles.length >= maxFotos) {
      if (!esPremium) setShowPremiumModal(true);
      else mostrarToast("Máximo alcanzado");
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

    if (error || !data) {
      mostrarToast("No se pudo agregar");
      return;
    }

    setImages((prev) =>
      prev.map((i) =>
        i && i.id === draggingId
          ? { ...i, id: data.id, enPortfolio: true }
          : i
      )
    );
  };

  const devolverABandeja = async () => {
    const img = images.find((i) => i && i.id === draggingId);
    if (!img || !img.enPortfolio) return;

    await supabase.from("portfolio_images").delete().eq("id", img.id);

    setImages((prev) =>
      prev.map((i) =>
        i && i.id === draggingId ? { ...i, enPortfolio: false } : i
      )
    );
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

  // =========================
  // RENDER
  // =========================
  return (
    <div className="portfolio-builder">
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
          onDrop={!isMobile ? eliminarImagen : undefined}
        >
          🗑 Eliminar
        </div>
      </div>

      {/* BANDEJA */}
      <div className="portfolio-tray">
        <div className="tray-header">Bandeja</div>

        <div className="tray-content">
          {trayImages.map((img) => (
            <div key={img.id} className="tray-item-wrapper">
              <img
                src={img.url}
                className="tray-item"
                draggable={!isMobile}
                onDragStart={() => !isMobile && handleDragStart(img.id)}
                alt=""
              />

              {isMobile && (
                <button
                  className="tray-add-btn"
                  onClick={() => {
                    setDraggingId(img.id);
                    colocarEnPortfolio();
                  }}
                >
                  ➕ Agregar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PORTFOLIO */}
      <div
        className={esPremium ? "portfolio-masonry" : "portfolio-uniform"}
        onDragOver={!isMobile ? permitirDrop : undefined}
        onDrop={!isMobile ? colocarEnPortfolio : undefined}
      >
        {visibles.length === 0 && (
          <div className="portfolio-drop-placeholder">
            Arrastrá o agregá imágenes ✨
          </div>
        )}

        {visibles.map((img) => (
          <div
            key={img.id}
            className="uniform-item"
            draggable={!isMobile}
            onDragStart={() => !isMobile && handleDragStart(img.id)}
          >
            <img src={img.url} alt="" />

            {isMobile && (
              <button
                className="portfolio-remove-btn"
                onClick={() => {
                  setDraggingId(img.id);
                  devolverABandeja();
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default PortfolioBuilder;
