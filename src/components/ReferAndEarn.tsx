import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const ReferAndEarn = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    email: '',
    preferredContact: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { submitToGoogleSheets } = await import('../lib/googleSheets');
      const result = await submitToGoogleSheets('refer', formData);
      
      if (result.success) {
        setIsDialogOpen(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          city: '',
          phone: '',
          email: '',
          preferredContact: '',
        });
        // Show success message (you can add a toast notification here)
        alert('Thank you! We will contact you soon.');
      } else {
        alert(result.error || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <>
      <section id="refer-earn" className="py-12 sm:py-16 bg-neutral-200 text-neutral-900">
        <div className="container mx-auto px-6 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Image */}
            <div
              className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden order-2 lg:order-1 border border-neutral-300 bg-cover bg-center"
              style={{ backgroundImage: "url('/economy.jpg.png')" }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Right side - Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-neutral-900">
                {t('referEarn.title')}
              </h2>
              
              <div className="space-y-4">
                <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed">
                  {t('referEarn.subtitle')}
                </p>
                
                <p className="text-base sm:text-lg text-neutral-600">
                  {t('referEarn.description')}
                </p>
                
                <p className="text-sm text-neutral-500 italic">
                  {t('referEarn.disclaimer')}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsDialogOpen(true)}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg border border-neutral-900/60 bg-white/10 text-neutral-900 hover:bg-white/30 transition-colors shadow-sm backdrop-blur"
                >
                  {t('referEarn.cta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refer Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('referEarn.form.title')}</DialogTitle>
            <DialogDescription>{t('referEarn.form.description')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('referEarn.form.firstName')}</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('referEarn.form.lastName')}</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('referEarn.form.city')}</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('referEarn.form.phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('referEarn.form.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredContact">{t('referEarn.form.preferredContact')}</Label>
              <Input
                id="preferredContact"
                name="preferredContact"
                type="text"
                required
                value={formData.preferredContact}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t('referEarn.form.cancel')}
              </Button>
              <Button type="submit">
                {t('referEarn.form.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
