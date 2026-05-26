import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { login, googleLogin } from '../api/auth';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ phone_number: '', password: '' });
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      loginUser(data.access, data.refresh, { full_name: data.full_name, role: data.role });
      navigate('/dashboard');
    } catch (err) {
      setError(t('loginInvalidCreds'));
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const { data } = await googleLogin(response.credential);
      loginUser(data.access, data.refresh, { full_name: data.full_name, role: data.role });
      navigate('/dashboard');
    } catch (err) {
      setError(t('loginGoogleFailed'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-8">{t('loginTitle')}</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('loginPhone')}</label>
            <input 
              type="text" 
              name="phone_number" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.phone_number} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('loginPassword')}</label>
            <input 
              type="password" 
              name="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium">
            {t('loginBtn')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <span className="text-gray-500 text-sm">{t('loginOr')}</span>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('loginGoogleFailed'))}
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('loginNoAccount')} <Link to="/register" className="text-secondary font-medium hover:underline">{t('loginRegisterLink')}</Link>
        </p>
      </div>
    </div>
  );
}
