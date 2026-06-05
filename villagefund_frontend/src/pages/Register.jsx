import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ phone_number: '', full_name: '', email: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError(t('registerPasswordMismatch'));
      return;
    }
    try {
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(t('registerFailed'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface rounded-lg shadow-xl p-8 border border-border">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-8">{t('registerTitle')}</h2>
        
        {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('registerName')}</label>
            <input 
              type="text" 
              name="full_name" 
              className="w-full px-4 py-2 border border-border bg-background rounded-md text-text focus:ring-primary focus:border-primary outline-none"
              value={formData.full_name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('registerEmail')}</label>
            <input 
              type="email" 
              name="email" 
              className="w-full px-4 py-2 border border-border bg-background rounded-md text-text focus:ring-primary focus:border-primary outline-none"
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('registerPhone')}</label>
            <input 
              type="text" 
              name="phone_number" 
              className="w-full px-4 py-2 border border-border bg-background rounded-md text-text focus:ring-primary focus:border-primary outline-none"
              value={formData.phone_number} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('registerPassword')}</label>
            <input 
              type="password" 
              name="password" 
              className="w-full px-4 py-2 border border-border bg-background rounded-md text-text focus:ring-primary focus:border-primary outline-none"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('registerConfirmPassword')}</label>
            <input 
              type="password" 
              name="password_confirm" 
              className="w-full px-4 py-2 border border-border bg-background rounded-md text-text focus:ring-primary focus:border-primary outline-none"
              value={formData.password_confirm} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium mt-6">
            {t('registerBtn')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('registerHaveAccount')} <Link to="/login" className="text-secondary font-medium hover:underline">{t('registerLoginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
