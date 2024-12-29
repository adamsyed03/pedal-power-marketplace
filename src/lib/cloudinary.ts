import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: 'your-cloud-name' // Replace with your cloud name
  },
  url: {
    secure: true // Force HTTPS
  }
}); 