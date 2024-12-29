import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/uploadImage';

export const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage('');
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload the file
      await uploadImage('hero/Tara.jpg', file);
      setMessage('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 items-start">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Select Image'}
        </label>
        {message && (
          <p className={message.includes('failed') ? 'text-red-500' : 'text-green-500'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}; 