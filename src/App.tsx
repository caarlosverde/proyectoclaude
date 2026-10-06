import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { UpgradeProvider } from "./components/Upgrade";
import { FeedbackProvider } from "./components/Feedback";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { scrollAppTop } from "./components/nav";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Calculator from "./pages/Calculator";
import Privacy from "./pages/Privacy";
import HourlyRate from "./pages/HourlyRate";
import { ProfessionPage, ProfessionsIndex } from "./pages/Professions";
import { GuidePage, GuidesIndex } from "./pages/Guides";
import { applySeo, getSeo } from "./seo/seo";
import AppLayout from "./pages/app/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Documents from "./pages/app/Documents";
import Editor from "./pages/app/Editor";
import Clients from "./pages/app/Clients";
import SettingsPage from "./pages/app/Settings";

/**
 * Al cambiar de pantalla volvemos arriba. Además de la ventana, llevamos el inicio
 * de la app a la vista en los contenedores que la envuelven (p. ej. un iframe que
 * crece con el contenido), para no quedarnos mirando una zona vacía.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollAppTop();
  }, [pathname]);
  return null;
}

/** Título, descripción, canonical y robots de cada pantalla. */
function SeoSync() {
  const { pathname } = useLocation();
  useEffect(() => applySeo(getSeo(pathname)), [pathname]);
  return null;
}

function Screens() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/precios" element={<Pricing />} />
        <Route path="/calculadora-iva-irpf" element={<Calculator />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/calculadora-precio-hora" element={<HourlyRate />} />
        <Route path="/factura-para" element={<ProfessionsIndex />} />
        <Route path="/factura-para/:slug" element={<ProfessionPage />} />
        <Route path="/guias" element={<GuidesIndex />} />
        <Route path="/guias/:slug" element={<GuidePage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documentos" element={<Documents />} />
          <Route path="nuevo/:kind" element={<Editor />} />
          <Route path="documentos/:id" element={<Editor />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="ajustes" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <FeedbackProvider>
    <UpgradeProvider>
      <ScrollToTop />
      <SeoSync />
      <Screens />
    </UpgradeProvider>
    </FeedbackProvider>
  );
}
