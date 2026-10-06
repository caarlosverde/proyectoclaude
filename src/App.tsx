import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { UpgradeProvider } from "./components/Upgrade";
import { FeedbackProvider } from "./components/Feedback";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Calculator from "./pages/Calculator";
import Privacy from "./pages/Privacy";
import AppLayout from "./pages/app/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Documents from "./pages/app/Documents";
import Editor from "./pages/app/Editor";
import Clients from "./pages/app/Clients";
import SettingsPage from "./pages/app/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <FeedbackProvider>
    <UpgradeProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/precios" element={<Pricing />} />
        <Route path="/calculadora-iva-irpf" element={<Calculator />} />
        <Route path="/privacidad" element={<Privacy />} />
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
    </UpgradeProvider>
    </FeedbackProvider>
  );
}
