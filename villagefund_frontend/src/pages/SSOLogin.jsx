import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function SSOLogin() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const role = params.get('role');
    const full_name = params.get('full_name');

    if (access && refresh) {
      // Log the user in
      loginUser(access, refresh, { role, full_name });
      
      // Redirect to the admin dashboard
      navigate('/admin', { replace: true });
    } else {
      // If tokens are missing, go to standard login
      navigate('/login', { replace: true });
    }
  }, [location, loginUser, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Authenticating via Admin SSO...</p>
      </div>
    </div>
  );
}
