import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, emoji, is_active, has_intermediate")
        .order("order_index");

      setCategories(data || []);
      setLoading(false);
    };

    load();
  }, []);

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async (categoryId) => {
    const ok = window.confirm(
      "¿Seguro que querés eliminar esta categoría?\n\n" +
        "Se eliminarán también todas sus subcategorías."
    );

    if (!ok) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error(error);
      alert("No se pudo eliminar la categoría.");
      return;
    }

    // actualizar UI sin recargar
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  if (loading) return <p>Cargando categorías…</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Categorías</h1>

        <button
          className="admin-primary-btn"
          onClick={() => navigate("/admin/categories/new")}
        >
          + Crear categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <p>No hay categorías creadas.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Emoji</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={{ fontSize: "1.3rem" }}>{cat.emoji}</td>
                <td>{cat.name}</td>
                <td>{cat.has_intermediate ? "Compuesta" : "Simple"}</td>
                <td>{cat.is_active ? "Activa" : "Inactiva"}</td>
                <td>
                  <button
                    className="admin-btn"
                    onClick={() => navigate(`/admin/categories/${cat.id}`)}
                  >
                    Editar
                  </button>

                  <button
                    className="admin-btn admin-danger-btn"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => handleDelete(cat.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminCategories;
