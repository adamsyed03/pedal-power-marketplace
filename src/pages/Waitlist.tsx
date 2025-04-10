import React, { useState } from "react";

// Use the provided Tara-nature video URL
const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Build the submission object with email and current date/time (ISO format)
    const submission = {
      email,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Replace with the actual Worker URL from your Wrangler publish output.
      const workerUrl = "https://waitlist-worker.ctinvestmentswork.workers.dev";
      const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage("Hvala, uspešno ste se prijavili!");
        setEmail(""); // Clear the input field after success.
      } else {
        const errorData = await response.json();
        setMessage("Greška: " + (errorData.error || "Nepoznata greška."));
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage("Prijava nije uspela.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-50"
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 bg-transparent">
        <h1 className="text-3xl font-bold text-white mb-4">Pridružite se čekanju</h1>
        <p className="text-lg text-white mb-8 text-center">
          Unesite svoju email adresu da biste se pridružili listi čekanja.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Unesite svoju email adresu ovde"
            required
            className="w-64 p-2 text-sm border border-gray-300 rounded placeholder-gray-400"
          />
          <button
            type="submit"
            className="w-64 p-2 text-sm bg-gray-800 text-white hover:bg-gray-700 rounded"
          >
            Pošaljite
          </button>
        </form>
        {message && <p className="mt-4 text-center text-white">{message}</p>}
      </div>
    </div>
  );
}
