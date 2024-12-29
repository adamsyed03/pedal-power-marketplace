import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Dealers from "@/pages/Dealers";
import UrbanExplorer from "@/pages/BikeDetails/UrbanExplorer";
import MountainMaster from "@/pages/BikeDetails/MountainMaster";
import CityCruiser from "@/pages/BikeDetails/CityCruiser";

function App() {
  return (
    <Router>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
