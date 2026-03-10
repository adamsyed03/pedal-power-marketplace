import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { submitBuyer } from "../utils/googleSheets";

const VIDEO_URL = "https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/tara-nature.mp4";

export default function BuyWaitlistPage() {
  const { language } = useLanguage();
  const isSerbian = language === "sr";

  const copy = {
    title: isSerbian ? "Kupi Pogon sklopivi bicikl" : "Buy the Pogon foldable bike",
    subtitle: isSerbian
      ? "Cena: 170,000 RSD. Ostavite email i tim ce vam se javiti sa detaljima kupovine."
      : "Price: 170,000 RSD. Leave your email and our team will contact you with purchase details.",
    placeholder: isSerbian ? "Unesite email adresu" : "Enter your email address",
    submit: isSerbian ? "Posalji" : "Submit",
    submitting: isSerbian ? "Slanje..." : "Submitting...",
    success: isSerbian ? "Hvala! Uspesno ste poslali upit za kupovinu." : "Thanks! Your buy inquiry was submitted.",
    error: isSerbian ? "Greska: slanje nije uspelo." : "Error: submission failed.",
    note: isSerbian ? "Ovo je buy waitlist / email us forma." : "This is the buy waitlist / email us form.",
  };

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await submitBuyer({ email });
      setMessage(copy.success);
      setEmail("");
    } catch (error: any) {
      console.error("Error submitting data:", error);
      const errorMsg = error?.message || "Unknown error";
      setMessage(`${copy.error} (${errorMsg})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/20 bg-black/35 p-6 sm:p-8 backdrop-blur">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">{copy.title}</h1>
        <p className="mt-3 text-center text-white/90">{copy.subtitle}</p>
        <p className="mt-1 text-center text-xs text-white/70">{copy.note}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.placeholder}
            required
            disabled={isSubmitting}
            className="w-full rounded-md border border-white/30 bg-white px-4 py-3 text-sm text-neutral-900 outline-none ring-0"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#5f7f67] px-4 py-3 font-semibold text-white transition hover:bg-[#4f6a56] disabled:opacity-50"
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </button>
        </form>

        {message ? <p className="mt-4 text-center text-sm text-white">{message}</p> : null}
      </div>
    </div>
  );
}
