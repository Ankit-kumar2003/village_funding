import axios from 'axios';

const CLOUD_NAME = 'dieykm68z';
const UPLOAD_PRESET = 'village_preset'; // Unsigned preset name in Cloudinary

/**
 * Uploads a file directly to Cloudinary using their REST API
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary direct upload failed:', error);
    throw new Error(
      error.response?.data?.error?.message || 'Failed to upload image to Cloudinary.'
    );
  }
};

/**
 * Injects Cloudinary transformation params into an existing Cloudinary URL.
 * Works only for res.cloudinary.com URLs — passes through all other URLs unchanged.
 *
 * @param {string} url   - The original Cloudinary URL
 * @param {string} transforms - Transformation string, e.g. "c_fill,g_auto,w_600,h_600,q_auto,f_auto"
 * @returns {string} - Transformed URL
 *
 * Example:
 *   Input:  https://res.cloudinary.com/dieykm68z/image/upload/v123/sample.jpg
 *   Output: https://res.cloudinary.com/dieykm68z/image/upload/c_fill,g_auto,w_600,h_600,q_auto,f_auto/v123/sample.jpg
 */
export const cloudinaryTransform = (url, transforms = 'c_fill,g_auto,w_600,h_600,q_auto,f_auto') => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Insert transformation string right after /upload/
  return url.replace('/upload/', `/upload/${transforms}/`);
};

