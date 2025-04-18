import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Intro } from "@/components/Intro";
import { useState } from "react";
import Index from "@/pages/Index";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Dealers from "@/pages/Dealers";
import UrbanExplorer from "@/pages/BikeDetails/UrbanExplorer";
import MountainMaster from "@/pages/BikeDetails/MountainMaster";
import CityCruiser from "@/pages/BikeDetails/CityCruiser";
import WaitlistPage from "@/pages/Waitlist"; // Updated import using the correct file name

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <Router>
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
            <Route path="/bikes/urban-explorer" element={<UrbanExplorer />} />
            <Route path="/bikes/mountain-master" element={<MountainMaster />} />
            <Route path="/bikes/city-cruiser" element={<CityCruiser />} />
            <Route path="/waitlist" element={<WaitlistPage />} /> {/* New route for Waitlist */}
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
