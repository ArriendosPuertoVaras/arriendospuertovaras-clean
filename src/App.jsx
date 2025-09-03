import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Blog from "./pages/Blog.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";

// NUEVAS páginas (placeholders que creamos)
import Properties from "./pages/Properties.jsx";
import ServicesHub from "./pages/ServicesHub.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import AddService from "./pages/AddService.jsx";
import BecomeHost from "./pages/BecomeHost.jsx";

import QuienesSomos from "./pages/QuienesSomos.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import SiteMap from "./pages/SiteMap.jsx";
import CompanyData from "./pages/CompanyData.jsx";
import HelpCategory from "./pages/HelpCategory.jsx";

// HashRouter en local, BrowserRouter en prod
const useHash = import.meta?.env?.VITE_USE_HASH === "true";
const RouterImpl = useHash ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <RouterImpl>
      <Routes>
        <Route element={<Layout />}>
          {/* Básicas */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/:slug" element={<HelpCategory />} />

          {/* Propiedades */}
          <Route path="/properties/*" element={<Properties />} />
          <Route path="/propiedades/*" element={<Properties />} />

          {/* Servicios */}
          <Route path="/services/*" element={<ServicesHub />} />
          <Route path="/servicios/*" element={<ServicesHub />} />

          {/* Publicar */}
          <Route path="/publicar" element={<AddProperty />} />
          <Route path="/publicar/propiedad" element={<AddProperty />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/publicar/servicio" element={<AddService />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/anfitrion" element={<BecomeHost />} />

          {/* Footer links */}
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/about" element={<QuienesSomos />} />

          <Route path="/blog" element={<Blog />} />

          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/reseñas" element={<Testimonials />} />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />

          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terminos" element={<TermsAndConditions />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />

          <Route path="/sitemap" element={<SiteMap />} />
          <Route path="/mapa-del-sitio" element={<SiteMap />} />

          <Route path="/company" element={<CompanyData />} />
          <Route path="/datos-empresa" element={<CompanyData />} />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </RouterImpl>
  );
}
