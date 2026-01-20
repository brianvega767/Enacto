import { useParams, useNavigate, Link } from "react-router-dom";
import "./CategoryResults.css";

function CategoryResults() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ✅ FIX: mostrar SOLO la categoría base (no subcategorías)
  const baseCategory = String(slug || "").split("-")[0];

  const formatted =
    baseCategory.charAt(0).toUpperCase() + baseCategory.slice(1);

  return (
    <div className="category-page">
      {/* Botón volver */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="category-card">
        <h1>{formatted}</h1>

        <p className="category-sub">
          En esta sección aparecerán{" "}
          <strong>todos los profesionales activos</strong> de esta categoría.
        </p>

        <p className="category-sub">
          Podrás filtrarlos por{" "}
          <strong>zona, localidad, tipo de servicio</strong> y más criterios.
        </p>

        <p className="category-sub">
          Todavía no hay perfiles cargados en esta categoría.
        </p>

        <Link to="/register" className="category-btn">
          Crear mi perfil
        </Link>
      </div>
    </div>
  );
}

export default CategoryResults;
