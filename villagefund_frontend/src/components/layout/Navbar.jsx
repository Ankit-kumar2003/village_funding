import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-background shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold font-heading tracking-wide">
          VillageFund
        </Link>
        <ul className="flex space-x-6 text-sm font-medium">
          <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
          <li><Link to="/campaigns" className="hover:text-accent transition-colors">Campaigns</Link></li>
          <li><Link to="/transparency" className="hover:text-accent transition-colors">Transparency</Link></li>
          <li><Link to="/leaderboard" className="hover:text-accent transition-colors">Leaderboard</Link></li>
          <li><Link to="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
        </ul>
        <div className="flex space-x-4 items-center">
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-background"
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">
                Hi, {user.full_name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-transparent border border-background rounded-md hover:bg-background hover:text-primary transition-colors text-sm font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-transparent border border-background rounded-md hover:bg-background hover:text-primary transition-colors text-sm font-medium">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-accent text-text rounded-md hover:bg-yellow-500 transition-colors text-sm font-medium">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
