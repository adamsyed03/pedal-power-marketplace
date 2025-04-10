import React, { useState } from "react";

// Use the provided Tara-nature video URL
const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle email submission logic here
    console.log("Email submitted:", email);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover filter brightness-90"
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Light Gray Overlay */}
      <div className="absolute inset-0 bg-gray-100 opacity-30"></div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pridružite se čekanju
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Unesite svoju email adresu da biste se pridružili listi čekanja.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Unesite svoju email adresu ovde"
            required
            className="w-64 p-2 text-sm text-gray-900 border border-gray-300 rounded placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-64 p-2 text-sm bg-gray-200 text-gray-900 hover:bg-gray-300 rounded"
          >
            Pošaljite
          </button>
        </form>
      </div>
    </div>
  );
}
