import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ReferFriendBanner from "./components/ReferFriendBanner";
import Index from "@/pages/Index";
import Lifestyle from "@/pages/Lifestyle";
import Delivery from "@/pages/Delivery";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Dealers from "@/pages/Dealers";
import UrbanExplorer from "@/pages/BikeDetails/UrbanExplorer";
import MountainMaster from "@/pages/BikeDetails/MountainMaster";
import CityCruiser from "@/pages/BikeDetails/CityCruiser";
import WaitlistPage from "@/pages/Waitlist"; // Updated import using the correct file name
import RentWaitlist from "@/pages/RentWaitlist";
import BuyWaitlist from "@/pages/BuyWaitlist";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <div className="pt-20">
            <ReferFriendBanner />
          </div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/bikes/pogon-x" element={<UrbanExplorer />} />
            <Route path="/bikes/mountain-master" element={<MountainMaster />} />
            <Route path="/bikes/city-cruiser" element={<CityCruiser />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/rent-waitlist" element={<RentWaitlist />} />
            <Route path="/buy-waitlist" element={<BuyWaitlist />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <LanguageSwitcher />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
