import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Executive() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setDebugInfo("");
    
    try {
      // Store in localStorage as a backup
      const storedEmails = JSON.parse(localStorage.getItem('executiveEmails') || '[]');
      storedEmails.push({
        email,
        timestamp: new Date().toISOString(),
        type: 'executive'
      });
      localStorage.setItem('executiveEmails', JSON.stringify(storedEmails));
      
      // Use your Cloudflare Worker URL
      const workerUrl = 'https://dark-star-0994.ctinvestmentswork.workers.dev';
      
      console.log("Submitting to worker:", workerUrl);
      console.log("Email:", email);
      
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          type: 'executive'
        }),
      });
      
      console.log("Response status:", response.status);
      
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Response text:", responseText);
        
        const data = JSON.parse(responseText);
        console.log("Response data:", data);
        
        if (response.ok) {
          setSubmitStatus('success');
          setEmail("");
          setDebugInfo(`Success! Response: ${JSON.stringify(data)}`);
        } else {
          console.error('Failed to submit email:', data);
          setSubmitStatus('error');
          setDebugInfo(`Error: ${JSON.stringify(data)}`);
        }
      } catch (e) {
        console.error("Error parsing response:", e);
        setSubmitStatus('error');
        setDebugInfo(`Error parsing response: ${e.message}. Raw response: ${responseText}`);
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus('error');
      setDebugInfo(`Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-20 bg-gray-100/80 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-12 bg-white/90 shadow-md rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Izvršni Direktor</h1>
          <p className="text-xl text-gray-700 mb-8">
            Postanite ambasador brenda i širite Pogon brend kroz vaš grad. Pridružite se porodici i uživajte u svim pogodnostima koje dolaze uz to.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Pridružite se pokretu
            </h2>
            <Input
              type="email"
              placeholder="Vaša email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-md focus:border-gray-500 focus:ring-gray-500"
            />
            <p className="text-sm text-gray-600 text-center italic">
              (Dodatni detalji o affiliate programu biće podeljeni putem email-a)
            </p>
          </div>
          
          {submitStatus === 'success' && (
            <p className="text-green-600 text-center font-medium">
              Hvala na interesovanju! Uskoro ćemo vas kontaktirati.
            </p>
          )}
          
          {submitStatus === 'error' && (
            <p className="text-red-600 text-center font-medium">
              Došlo je do greške. Molimo pokušajte ponovo kasnije.
            </p>
          )}
          
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
              <pre>{debugInfo}</pre>
            </div>
          )}
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-xl bg-gray-800 hover:bg-gray-900 text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Slanje...' : 'Pošalji'}
          </Button>
        </form>
      </div>
    </div>
  );
} 