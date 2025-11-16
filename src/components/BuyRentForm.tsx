import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';
import { submitToGoogleSheets, BuyRentFormData } from '../lib/googleSheets';

interface BuyRentFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'buy' | 'rent';
  modelName?: string;
}

export const BuyRentForm: React.FC<BuyRentFormProps> = ({ isOpen, onClose, type, modelName }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<BuyRentFormData>({
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    email: '',
    preferredContact: '',
    model: modelName || '',
    ...(type === 'rent' && { duration: '' }),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await submitToGoogleSheets(type, formData);
      
      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          city: '',
          phone: '',
          email: '',
          preferredContact: '',
          model: modelName || '',
          ...(type === 'rent' && { duration: '' }),
        });
        alert(t(`buyRent.form.${type}.success`));
      } else {
        alert(result.error || t(`buyRent.form.${type}.error`));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(t(`buyRent.form.${type}.error`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(`buyRent.form.${type}.title`)}</DialogTitle>
          <DialogDescription>{t(`buyRent.form.${type}.description`)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('buyRent.form.firstName')}</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('buyRent.form.lastName')}</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t('buyRent.form.city')}</Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('buyRent.form.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('buyRent.form.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          {modelName && (
            <div className="space-y-2">
              <Label htmlFor="model">{t('buyRent.form.model')}</Label>
              <Input
                id="model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleInputChange}
                disabled
                className="bg-neutral-100"
              />
            </div>
          )}
          {type === 'rent' && (
            <div className="space-y-2">
              <Label htmlFor="duration">{t('buyRent.form.rent.duration')}</Label>
              <Input
                id="duration"
                name="duration"
                type="text"
                required
                value={formData.duration || ''}
                onChange={handleInputChange}
                placeholder={t('buyRent.form.rent.durationPlaceholder')}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="preferredContact">{t('buyRent.form.preferredContact')}</Label>
            <Input
              id="preferredContact"
              name="preferredContact"
              type="text"
              required
              value={formData.preferredContact}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('buyRent.form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('buyRent.form.submitting') : t('buyRent.form.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
