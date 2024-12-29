import { supabase } from './supabase';

export async function uploadImage(filePath: string, file: File) {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 