import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { submitPartner } from '../utils/googleSheets';

const countryCodes = [
  { code: '+381', country: 'Serbia (SRB)' },
  { code: '+1', country: 'United States (US)' },
  { code: '+44', country: 'United Kingdom (UK)' },
  { code: '+387', country: 'Bosnia and Herzegovina (BA)' },
  { code: '+382', country: 'Montenegro (ME)' },
  { code: '+383', country: 'Kosovo (XK)' },
  { code: '+389', country: 'North Macedonia (MK)' },
  { code: '+385', country: 'Croatia (HR)' },
  { code: '+386', country: 'Slovenia (SI)' },
  { code: '+43', country: 'Austria (AT)' },
  { code: '+49', country: 'Germany (DE)' },
  { code: '+33', country: 'France (FR)' },
  { code: '+39', country: 'Italy (IT)' },
  { code: '+34', country: 'Spain (ES)' },
  { code: '+7', country: 'Russia (RU)' },
];

export const ReferAndEarn = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    countryCode: '+381',
    phone: '',
    email: '',
    preferredContact: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, countryCode: value }));
  };

  const handlePreferredContactChange = (value: string) => {
    setFormData(prev => ({ ...prev, preferredContact: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await submitPartner({
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
        phone: `${formData.countryCode}${formData.phone}`,
        email: formData.email,
        preferredContact: formData.preferredContact,
      });
      setSubmitMessage(t('referEarn.form.success') || 'Thank you! Your submission has been received.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          city: '',
          countryCode: '+381',
          phone: '',
          email: '',
          preferredContact: '',
        });
        setIsDialogOpen(false);
        setSubmitMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage(t('referEarn.form.error') || 'There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={handleCountryCodeChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.code} {country.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="flex-1"
                  placeholder={t('referEarn.form.phonePlaceholder') || 'Phone number'}
                />
              </div>
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
              <Select value={formData.preferredContact} onValueChange={handlePreferredContactChange} required>
                <SelectTrigger id="preferredContact">
                  <SelectValue placeholder={t('referEarn.form.preferredContactPlaceholder') || 'Select preferred contact'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">{t('referEarn.form.contact.call') || 'Call'}</SelectItem>
                  <SelectItem value="Email">{t('referEarn.form.contact.email') || 'Email'}</SelectItem>
                  <SelectItem value="WhatsApp">{t('referEarn.form.contact.whatsapp') || 'WhatsApp'}</SelectItem>
                  <SelectItem value="Viber">{t('referEarn.form.contact.viber') || 'Viber'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {submitMessage && (
              <div className={`p-3 rounded-md text-sm ${
                submitMessage.includes('error') || submitMessage.includes('Error')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {submitMessage}
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSubmitMessage('');
                }}
                disabled={isSubmitting}
              >
                {t('referEarn.form.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (t('referEarn.form.submitting') || 'Submitting...') : t('referEarn.form.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
