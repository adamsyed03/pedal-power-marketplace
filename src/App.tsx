import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Intro } from "@/components/Intro";
import { useState, useEffect } from "react";
import Index from "@/pages/Index";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Dealers from "@/pages/Dealers";
import UrbanExplorer from "@/pages/BikeDetails/UrbanExplorer";
import MountainMaster from "@/pages/BikeDetails/MountainMaster";
import CityCruiser from "@/pages/BikeDetails/CityCruiser";
import WaitlistPage from "@/pages/Waitlist"; // Updated import using the correct file name

function AppContent() {
  const [showIntro, setShowIntro] = useState(false); // Default to false
  const location = useLocation();
  
  useEffect(() => {
    // Only show intro on the home page and if it's not a direct navigation from another page
    if (location.pathname === '/' && !location.key) {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, [location]);

  return (
    <>
      {showIntro ? (
        <Intro setShowIntro={setShowIntro} />
      ) : (
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/bikes/pogon-x" element={<UrbanExplorer />} />
            <Route path="/bikes/mountain-master" element={<MountainMaster />} />
            <Route path="/bikes/city-cruiser" element={<CityCruiser />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
