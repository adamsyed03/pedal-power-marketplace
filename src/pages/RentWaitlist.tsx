import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { submitRenter } from "../utils/googleSheets";

// Use the provided Tara-nature video URL
const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4";

export default function RentWaitlistPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await submitRenter({ email });

      setMessage(t('rentWaitlist.success') || "Hvala, uspešno ste se prijavili!");
      setEmail("");
    } catch (error: any) {
      console.error("Error submitting data:", error);
      const errorMsg = error?.message || "Unknown error";
      setMessage(`${t('rentWaitlist.error') || 'Error: Sign up failed.'} (${errorMsg})`);
    } finally {
      setIsSubmitting(false);
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
        className="absolute inset-0 w-full h-full object-cover opacity-75"
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for Fading Effect */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 min-h-screen">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 text-center px-4">
          {t('rentWaitlist.title') || 'Pridružite se listi za iznajmljivanje'}
        </h1>
        <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 text-center px-4 max-w-md">
          {t('rentWaitlist.description') || 'Unesite svoju email adresu da biste se pridružili listi za iznajmljivanje.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-sm px-4">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={t('rentWaitlist.placeholder') || 'Unesite svoju email adresu ovde'}
            required
            disabled={isSubmitting}
            className="w-full p-3 sm:p-2.5 text-sm sm:text-base border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 sm:p-2.5 text-sm sm:text-base bg-gray-800 text-white hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (t('rentWaitlist.submitting') || 'Slanje...') : (t('rentWaitlist.submit') || 'Pošaljite')}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center text-white px-4 text-sm sm:text-base ${message.includes('Greška') || message.includes('Error') ? 'text-red-200' : ''}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

