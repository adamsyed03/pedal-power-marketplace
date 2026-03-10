import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LanguageProvider } from "./context/LanguageContext";
import Index from "@/pages/Index";
import Lifestyle from "@/pages/Lifestyle";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Dealers from "@/pages/Dealers";
import MountainMaster from "@/pages/BikeDetails/MountainMaster";
import CityCruiser from "@/pages/BikeDetails/CityCruiser";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#f4f5f1] text-[#111613]">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/bikes/glide-1" element={<Navigate to="/#bikes" replace />} />
            <Route path="/bikes/compact-1" element={<Navigate to="/#bikes" replace />} />
            <Route path="/bikes/pogon-x" element={<Navigate to="/#bikes" replace />} />
            <Route path="/bikes/mountain-master" element={<MountainMaster />} />
            <Route path="/bikes/city-cruiser" element={<CityCruiser />} />
            <Route path="/bikes/foldable" element={<Navigate to="/#bikes" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <LanguageSwitcher />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
