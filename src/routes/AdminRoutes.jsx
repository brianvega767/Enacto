import { Route } from "react-router-dom";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";

import AdminLayout from "../admin/AdminLayout";
import AdminDashboard from "../admin/AdminDashboard";
import AdminCategories from "../admin/AdminCategories";
import AdminEditCategory from "../admin/AdminEditCategory";
import AdminAvisos from "../admin/AdminAvisos";
import AdminEmailChangeRequests from "../admin/AdminEmailChangeRequests";
import AdminAyuda from "../admin/AdminAyuda";
import AdminFeriantes from "../admin/AdminFeriantes";
import CrearFerias from "../admin/CrearFerias";
import FeriasPublicadas from "../admin/FeriasPublicadas";
import EditarFeria from "../admin/EditarFeria";
import AdminReportes from "../admin/AdminReportes";

export default (
  <Route
    path="/admin"
    element={
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    }
  >
    {/* DASHBOARD */}
    <Route index element={<AdminDashboard />} />

    {/* REPORTES */}
    <Route path="reportes" element={<AdminReportes />} />

    {/* FERIAS */}
    <Route path="ferias/crear" element={<CrearFerias />} />
    <Route path="ferias" element={<FeriasPublicadas />} />
    <Route path="ferias/editar/:id" element={<EditarFeria />} />

    {/* AVISOS */}
    <Route path="avisos" element={<AdminAvisos />} />
    <Route path="avisos/herramientas" element={<AdminFeriantes />} />
    <Route
      path="avisos/cambio-email"
      element={<AdminEmailChangeRequests />}
    />

    {/* AYUDA */}
    <Route path="ayuda" element={<AdminAyuda />} />

    {/* CATEGORÍAS */}
    <Route path="categories" element={<AdminCategories />} />
    <Route path="categories/:id" element={<AdminEditCategory />} />
  </Route>
);
