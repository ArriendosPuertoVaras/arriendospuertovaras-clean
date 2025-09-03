import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas que ya confirmamos que existen:
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Blog from "@/pages/Blog";
import HelpCenter from "@/pages/HelpCenter";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* (Shell UI se conecta en el siguiente paso) */}
        <main className="flex-1">
          <Routes>
            <Route path="*" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/help" element={<HelpCenter />} />
            {/* Fallback al Home para rutas inexistentes */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
