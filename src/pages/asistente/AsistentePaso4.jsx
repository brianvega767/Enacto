import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../components/ToastGlobal";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

import { supabase } from "../../supabaseClient";
import PortfolioBuilder from "../../components/portfolio/PortfolioBuilder.jsx";

function AsistentePaso4() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, profile, loading } = useAuth();

  const [localLoading, setLocalLoading] = useState(false);
  const handledRef = useRef(false); // 🔒 CLAVE

  // ----------------------------------------------------
  // 👉 VALIDACIONES BÁSICAS (BLINDADAS)
  // ----------------------------------------------------
  useEffect(() => {
    if (loading) return;
    if (handledRef.current) return;

    // 🚫 Sin sesión
    if (!user) {
      handledRef.current = true;
      navigate("/login", { replace: true });
      return;
    }

    // 🚫 Perfil inválido
    if (!profile) {
      handledRef.current = true;
      showToast("Error al cargar tu perfil");
      navigate("/mi-cuenta", { replace: true });
      return;
    }

    // ✅ Todo OK → no hacer nada
  }, [loading, user, profile, navigate, showToast]);

  // ----------------------------------------------------
  // 👉 COMPLETAR LUEGO
  // ----------------------------------------------------
  const completarLuego = () => {
    if (localLoading) return;
    setLocalLoading(true);

    showToast(
      "Podés cargar o editar tu portfolio más adelante desde tu panel."
    );

    navigate("/mi-cuenta");
  };

  // ----------------------------------------------------
  // 👉 CONTINUAR
  // ----------------------------------------------------
  const continuar = () => {
    if (localLoading) return;
    setLocalLoading(true);

    showToast("¡Perfil profesional creado correctamente!");
    navigate("/mi-cuenta");
  };

  // ----------------------------------------------------
  // ⏳ ESPERA PERFIL
  // ----------------------------------------------------
  if (loading || !profile) {
    return (
      <div className="portfolio-page">
        <div className="portfolio-inner">
          <p>Cargando portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      {/* 🔙 BOTÓN VOLVER */}
      <button className="asistente-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="portfolio-inner">
        <h1 className="portfolio-title">Portfolio</h1>

        <p className="portfolio-subtitle">
          Subí tus mejores trabajos, dale impacto visual a tu perfil y atraé más
          clientes
        </p>

        {/* ✅ PORTFOLIO BUILDER CON PLAN REAL */}
        <PortfolioBuilder
          esPremium={profile.is_premium === true}
          supabase={supabase}
          userId={user.id}
        />

        <div className="portfolio-actions">
          <button
            className="portfolio-skip"
            onClick={completarLuego}
            disabled={localLoading}
          >
            Completar luego
          </button>

          <button
            className="portfolio-next"
            onClick={continuar}
            disabled={localLoading}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AsistentePaso4;
