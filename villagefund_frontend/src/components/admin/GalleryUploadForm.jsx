import { useState, useEffect } from 'react';
import { uploadToGallery } from '../../api/gallery';
import { getCampaigns } from '../../api/campaigns';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useLanguage } from '../../context/LanguageContext';
import { Camera, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GalleryUploadForm({ onPhotoAdded }) {
  const { language } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    caption: '',
    category: 'GENERAL',
    campaign: '',
    photo: '',
    is_featured: false,
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCampaigns().then((res) => {
      setCampaigns(res.data.results || res.data);
    }).catch(err => console.error("Failed to load campaigns for gallery form", err));
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, photo: url }));
      setMessage(
        language === 'en'
          ? 'Image uploaded successfully to Cloudinary!'
          : 'छवि क्लाउडिनरी पर सफलतापूर्वक अपलोड हो गई!'
      );
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.photo) {
      setError(language === 'en' ? 'Please choose and upload an image first.' : 'कृपया पहले एक छवि चुनें और अपलोड करें।');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        campaign: formData.campaign === '' ? null : formData.campaign,
      };

      await uploadToGallery(payload);

      setFormData({
        caption: '',
        category: 'GENERAL',
        campaign: '',
        photo: '',
        is_featured: false,
      });

      setMessage(
        language === 'en'
          ? 'Photo added to gallery successfully!'
          : 'फोटो गैलरी में सफलतापूर्वक जोड़ी गई!'
      );
      if (onPhotoAdded) onPhotoAdded();
    } catch (err) {
      console.error(err);
      setError(
        language === 'en'
          ? 'Failed to save photo record. Please try again.'
          : 'फोटो रिकॉर्ड सहेजने में विफल। कृपया पुन: प्रयास करें।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm text-text transition-colors duration-300">
      <h3 className="text-2xl font-black font-heading mb-6 flex items-center gap-2">
        <Camera className="w-6 h-6 text-primary" />
        {language === 'en' ? 'Upload Gallery Photo' : 'गैलरी फोटो अपलोड करें'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
            {language === 'en' ? 'Caption' : 'कैप्शन'}
          </label>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder={language === 'en' ? 'Describe what this photo represents...' : 'वर्णन करें कि यह फोटो क्या दर्शाती है...'}
            className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'Category' : 'श्रेणी'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-xs"
            >
              <option value="GENERAL" className="bg-surface">{language === 'en' ? 'General' : 'सामान्य'}</option>
              <option value="BEFORE" className="bg-surface">{language === 'en' ? 'Before project' : 'परियोजना से पहले'}</option>
              <option value="DURING" className="bg-surface">{language === 'en' ? 'During project' : 'परियोजना के दौरान'}</option>
              <option value="AFTER" className="bg-surface">{language === 'en' ? 'After project' : 'परियोजना के बाद'}</option>
              <option value="EVENT" className="bg-surface">{language === 'en' ? 'Event / Meeting' : 'कार्यक्रम / बैठक'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'Associated Campaign (Optional)' : 'संबद्ध अभियान (वैकल्पिक)'}
            </label>
            <select
              name="campaign"
              value={formData.campaign}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-xs"
            >
              <option value="" className="bg-surface">{language === 'en' ? 'None / General Photo' : 'कोई नहीं / सामान्य फोटो'}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            id="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
          />
          <label htmlFor="is_featured" className="text-xs font-bold text-text-muted uppercase select-none cursor-pointer">
            {language === 'en' ? 'Feature this photo on Home Page' : 'मुख्य पृष्ठ पर इस फोटो को प्रदर्शित करें'}
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
            {language === 'en' ? 'Select Image' : 'छवि चुनें'}
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-border rounded-2xl bg-background/30">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
              <Upload className="w-4 h-4" />
              {uploading ? (language === 'en' ? 'Uploading...' : 'अपलोड हो रहा है...') : (language === 'en' ? 'Choose Image' : 'छवि चुनें')}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider text-center sm:text-left">
              {formData.photo ? (
                <span className="text-green-500 font-extrabold">{language === 'en' ? 'Image uploaded to Cloudinary!' : 'छवि क्लाउडिनरी पर अपलोड हो गई!'}</span>
              ) : (
                language === 'en' ? 'Upload files directly to Cloudinary (PNG/JPG)' : 'फ़ाइलें सीधे क्लाउडिनरी पर अपलोड करें (PNG/JPG)'
              )}
            </div>
          </div>

          {formData.photo && (
            <div className="mt-3 relative w-full h-40 rounded-2xl overflow-hidden border border-border bg-background">
              <img
                src={formData.photo}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md transition-colors disabled:opacity-50 text-sm mt-4"
        >
          {submitting 
            ? (language === 'en' ? 'Saving Photo...' : 'फोटो सहेजी जा रही है...') 
            : (language === 'en' ? 'Upload Photo' : 'फोटो अपलोड करें')}
        </button>
      </form>
    </div>
  );
}
