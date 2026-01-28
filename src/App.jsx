import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastGlobal";
import ProtectedRoute from "./components/ProtectedRoute";
import LegalFooter from "./components/legal/LegalFooter";
import CookieBanner from "./components/legal/CookieBanner";
import DenunciarPerfil from "./pages/DenunciarPerfil";
import Premium from "./pages/Premium";

// Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MiCuenta from "./pages/MiCuenta";
import CategoryResults from "./pages/CategoryResults";
import PerfilPublico from "./profile/PerfilPublico";
import AdminRoutes from "./routes/AdminRoutes";
import PrivacyPage from "./pages/PrivacyPage";
import RecuperarEmail from "./pages/RecuperarEmail";
import VerifyEmail from "./pages/VerifyEmail";
import RecuperarPassword from "./pages/RecuperarPassword";
import ResetPassword from "./pages/ResetPassword";
import Ayuda from "./pages/Ayuda";
import AyudaPersonalizada from "./pages/AyudaPersonalizada";
import Buscar from "./pages/Buscar";
import CookiesPage from "./pages/CookiesPage";
import TermsPage from "./pages/TermsPage";

// Herramientas
import Ferias from "./pages/herramientas/Ferias";
import Colaboradores from "./pages/herramientas/Colaboradores";
import CrearColaborador from "./pages/herramientas/CrearColaborador";
import MisPublicaciones from "./pages/herramientas/MisPublicaciones";

// Asistente
import AsistentePaso1 from "./pages/asistente/AsistentePaso1";
import AsistentePasoIntermedio from "./pages/asistente/AsistentePasoIntermedio";
import AsistentePaso2 from "./pages/asistente/AsistentePaso2";
import AsistentePaso3 from "./pages/asistente/AsistentePaso3";
import AsistentePasoIntermedioPortfolio from "./pages/asistente/AsistentePasoIntermedioPortfolio";
import AsistentePaso4 from "./pages/asistente/AsistentePaso4";

// Configuración
import EditarPerfilPublico from "./pages/EditarPerfilPublico";
import Configuraciones from "./pages/Configuraciones";
import CambiarEmail from "./pages/CambiarEmail";
import CambiarPassword from "./pages/CambiarPassword";

function App() {
  return (
    <ToastProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/recuperar-email" element={<RecuperarEmail />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/premium" element={<Premium />} />

          {/* AYUDA */}
          <Route path="/ayuda" element={<Ayuda />} />
          <Route
            path="/ayuda/personalizada"
            element={<AyudaPersonalizada />}
          />

          {/* LEGALES */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* PÚBLICAS */}
          <Route path="/categoria/:slug" element={<CategoryResults />} />
          <Route path="/perfil/:slug" element={<PerfilPublico />} />

          {/* MI CUENTA */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute>
                <MiCuenta />
              </ProtectedRoute>
            }
          />

          {/* HERRAMIENTAS */}
          <Route path="/herramientas/ferias" element={<Ferias />} />
          <Route
            path="/herramientas/colaboradores"
            element={<Colaboradores />}
          />
          <Route
            path="/herramientas/colaboradores/crear"
            element={<CrearColaborador />}
          />
          <Route
            path="/herramientas/colaboradores/mis-publicaciones"
            element={<MisPublicaciones />}
          />

          {/* ASISTENTE */}
          <Route
            path="/asistente-profesional/paso-1"
            element={<AsistentePaso1 />}
          />
          <Route
            path="/asistente-profesional/paso-intermedio"
            element={<AsistentePasoIntermedio />}
          />
          <Route
            path="/asistente-profesional/paso-2"
            element={<AsistentePaso2 />}
          />
          <Route
            path="/asistente-profesional/paso-3"
            element={<AsistentePaso3 />}
          />
          <Route
            path="/asistente-profesional/intermedio-portfolio"
            element={<AsistentePasoIntermedioPortfolio />}
          />
          <Route
            path="/asistente-profesional/paso-4"
            element={<AsistentePaso4 />}
          />

          {/* CONFIGURACIÓN */}
          <Route path="/editar-perfil" element={<EditarPerfilPublico />} />
          <Route path="/configuracion" element={<Configuraciones />} />
          <Route
            path="/configuracion/email"
            element={<CambiarEmail />}
          />
          <Route
            path="/configuracion/password"
            element={<CambiarPassword />}
          />

          {/* DENUNCIA (overlay por portal) */}
          <Route
            path="/denunciar/:profileId"
            element={<DenunciarPerfil />}
          />

          {/* ADMIN */}
          {AdminRoutes}
        </Routes>

        {/* FOOTER + COOKIES */}
        <LegalFooter />
        <CookieBanner />
      </div>
    </ToastProvider>
  );
}

export default App;
