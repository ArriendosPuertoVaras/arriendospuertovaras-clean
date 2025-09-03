import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Blog from "./pages/Blog.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";

// NUEVO
import Properties from "./pages/Properties.jsx";
import ServicesHub from "./pages/ServicesHub.jsx";

// HashRouter en local, BrowserRouter en prod
const useHash = import.meta?.env?.VITE_USE_HASH === "true";
const RouterImpl = useHash ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <RouterImpl>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* NUEVO: Propiedades (es/en) */}
          <Route path="/properties/*" element={<Properties />} />
          <Route path="/propiedades/*" element={<Properties />} />

          {/* NUEVO: Servicios (es/en) */}
          <Route path="/services/*" element={<ServicesHub />} />
          <Route path="/servicios/*" element={<ServicesHub />} />

          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </RouterImpl>
  );
}
