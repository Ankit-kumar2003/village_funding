import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const [formData, setFormData] = useState({ phone_number: '', full_name: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError('Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-8">Join VillageFund</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Full Name</label>
            <input 
              type="text" 
              name="full_name" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.full_name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
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
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Confirm Password</label>
            <input 
              type="password" 
              name="password_confirm" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.password_confirm} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium mt-6">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-secondary font-medium hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
