import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  // mientras carga auth, no renderizamos nada
  if (loading) return null;

  // si no hay usuario → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
