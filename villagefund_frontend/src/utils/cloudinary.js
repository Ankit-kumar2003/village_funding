import axios from 'axios';

const CLOUD_NAME = 'dkawomkxk';
const UPLOAD_PRESET = 'ml_default'; // Default unsigned preset name in Cloudinary

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
