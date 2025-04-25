import React from "react";
import { Link } from "react-router-dom";

export default function JoinNetwork() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sales Agent Button - Takes up half the screen with skin tone beige color */}
      <Link 
        to="/join-network/sales-agent"
        className="flex-1 flex items-center justify-center bg-[#f5e1d0]/70 hover:bg-[#f5e1d0]/90 transition-duration-300 text-[#8b5a2b] p-8 border-b-4 md:border-b-0 md:border-r-4 border-neutral-300"
      >
        <span className="text-3xl md:text-4xl font-bold">Prodajni Agent</span>
      </Link>
      
      {/* Executive Button - Takes up half the screen with faint blue color */}
      <Link 
        to="/join-network/executive"
        className="flex-1 flex items-center justify-center bg-blue-100/70 hover:bg-blue-200/80 transition-duration-300 text-blue-900 p-8"
      >
        <span className="text-3xl md:text-4xl font-bold">Izvršni Direktor</span>
      </Link>
    </div>
  );
} 