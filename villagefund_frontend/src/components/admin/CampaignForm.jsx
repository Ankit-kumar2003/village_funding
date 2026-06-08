import { useState } from 'react';
import { createCampaign } from '../../api/campaigns';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useLanguage } from '../../context/LanguageContext';
import { Image, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CampaignForm({ onCampaignAdded }) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'INFRASTRUCTURE',
    goal_amount: '',
    start_date: '',
    end_date: '',
    campaign_upi_id: '',
    cover_image: '',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, cover_image: url }));
      setMessage(
        language === 'en' 
          ? 'Cover image uploaded successfully to Cloudinary!' 
          : 'कवर इमेज क्लाउडिनरी पर सफलतापूर्वक अपलोड हो गई!'
      );
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
      };

      await createCampaign(payload);
      
      setFormData({
        title: '',
        description: '',
        category: 'INFRASTRUCTURE',
        goal_amount: '',
        start_date: '',
        end_date: '',
        campaign_upi_id: '',
        cover_image: '',
      });

      setMessage(
        language === 'en' 
          ? 'Campaign created successfully!' 
          : 'अभियान सफलतापूर्वक बनाया गया!'
      );
      if (onCampaignAdded) onCampaignAdded();
    } catch (err) {
      console.error(err);
      setError(
        language === 'en'
          ? 'Failed to create campaign. Please check the fields.'
          : 'अभियान बनाने में विफल। कृपया फ़ील्ड जांचें।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm text-text transition-colors duration-300">
      <h3 className="text-2xl font-black font-heading mb-6 flex items-center gap-2">
        <Image className="w-6 h-6 text-primary" />
        {language === 'en' ? 'Launch New Campaign' : 'नया अभियान शुरू करें'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'Campaign Title' : 'अभियान का शीर्षक'}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={language === 'en' ? 'e.g. Water Pipeline Repair' : 'उदा. पानी की पाइपलाइन मरम्मत'}
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium text-sm"
              required
            />
          </div>

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
              <option value="INFRASTRUCTURE" className="bg-surface">{language === 'en' ? 'Infrastructure' : 'बुनियादी ढांचा'}</option>
              <option value="RELIGIOUS" className="bg-surface">{language === 'en' ? 'Religious' : 'धार्मिक'}</option>
              <option value="SOCIAL" className="bg-surface">{language === 'en' ? 'Social' : 'सामाजिक'}</option>
              <option value="CULTURAL" className="bg-surface">{language === 'en' ? 'Cultural' : 'सांस्कृतिक'}</option>
              <option value="EDUCATION" className="bg-surface">{language === 'en' ? 'Education' : 'शिक्षा'}</option>
              <option value="HEALTH" className="bg-surface">{language === 'en' ? 'Health' : 'स्वास्थ्य'}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
            {language === 'en' ? 'Campaign Description' : 'अभियान का विवरण'}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={language === 'en' ? 'Describe the goal and community impact of this project...' : 'इस परियोजना के लक्ष्य और सामुदायिक प्रभाव का वर्णन करें...'}
            rows="4"
            className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium text-sm leading-relaxed"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'Goal Amount (₹)' : 'लक्ष्य राशि (₹)'}
            </label>
            <input
              type="number"
              name="goal_amount"
              value={formData.goal_amount}
              onChange={handleChange}
              placeholder="Enter amount in ₹"
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'UPI ID for Direct Transfers (Optional)' : 'सीधे ट्रांसफर के लिए UPI ID (वैकल्पिक)'}
            </label>
            <input
              type="text"
              name="campaign_upi_id"
              value={formData.campaign_upi_id}
              onChange={handleChange}
              placeholder="e.g. villagefund@okaxis"
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'Start Date' : 'प्रारंभ तिथि'}
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
              {language === 'en' ? 'End Date' : 'अंतिम तिथि'}
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
            {language === 'en' ? 'Campaign Cover Image' : 'अभियान की कवर इमेज'}
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-border rounded-2xl bg-background/30">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
              <Upload className="w-4 h-4" />
              {uploading ? (language === 'en' ? 'Uploading...' : 'अपलोड हो रहा है...') : (language === 'en' ? 'Choose Image' : 'इमेज चुनें')}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider text-center sm:text-left">
              {formData.cover_image ? (
                <span className="text-green-500 font-extrabold">{language === 'en' ? 'Cloudinary Hosted URL ready!' : 'क्लाउडिनरी होस्टेड URL तैयार है!'}</span>
              ) : (
                language === 'en' ? 'Upload files directly to Cloudinary (PNG/JPG)' : 'फ़ाइलें सीधे क्लाउडिनरी पर अपलोड करें (PNG/JPG)'
              )}
            </div>
          </div>

          {formData.cover_image && (
            <div className="mt-3 relative w-full h-40 rounded-2xl overflow-hidden border border-border bg-background">
              <img
                src={formData.cover_image}
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
            ? (language === 'en' ? 'Launching Campaign...' : 'अभियान शुरू किया जा रहा है...') 
            : (language === 'en' ? 'Launch Campaign' : 'अभियान शुरू करें')}
        </button>
      </form>
    </div>
  );
}
