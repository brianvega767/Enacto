import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedAdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  // ⏳ Esperar a que termine auth
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando…</p>
      </div>
    );
  }

  // 🚫 Sin sesión
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⏳ Usuario logueado pero perfil todavía no cargó
  if (!profile) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Cargando perfil…</p>
      </div>
    );
  }

  // 🚫 No admin
  if (profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin válido
  return children;
}

export default ProtectedAdminRoute;
