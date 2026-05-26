import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-primary text-background shadow-md relative z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold font-heading tracking-wide" onClick={closeMenu}>
          VillageFund
        </Link>
        
        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex space-x-6 text-sm font-medium">
          <li><Link to="/" className="hover:text-accent transition-colors">{t('navHome')}</Link></li>
          <li><Link to="/campaigns" className="hover:text-accent transition-colors">{t('navCampaigns')}</Link></li>
          <li><Link to="/transparency" className="hover:text-accent transition-colors">{t('navTransparency')}</Link></li>
          <li><Link to="/leaderboard" className="hover:text-accent transition-colors">{t('navLeaderboard')}</Link></li>
          <li><Link to="/gallery" className="hover:text-accent transition-colors">{t('navGallery')}</Link></li>
        </ul>
        
        {/* Desktop Auth / Settings */}
        <div className="hidden lg:flex space-x-4 items-center">
          <button 
            onClick={toggleLanguage} 
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white shadow-inner"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'हिंदी' : 'EN'}
          </button>

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
              {(user.role === 'SUPER_ADMIN' || user.role === 'TREASURER') && (
                <Link to="/admin" className="text-sm font-medium text-accent hover:text-white transition-colors">
                  {t('navDashboard')}
                </Link>
              )}
              <Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors font-bold">
                Hi, {user.full_name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-transparent border border-background rounded-md hover:bg-background hover:text-primary transition-colors text-sm font-medium">
                {t('navLogout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-transparent border border-background rounded-md hover:bg-background hover:text-primary transition-colors text-sm font-medium">{t('navLogin')}</Link>
              <Link to="/register" className="px-4 py-2 bg-accent text-text rounded-md hover:bg-yellow-500 transition-colors text-sm font-medium">{t('navRegister')}</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Controls */}
        <div className="lg:hidden flex items-center space-x-3">
          <button onClick={toggleLanguage} className="p-1 text-white">
            <Globe className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-1 text-white">
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-white focus:outline-none">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-primary shadow-xl border-t border-white/10 z-50 flex flex-col">
          <ul className="flex flex-col space-y-4 px-6 py-6 text-base font-medium">
            <li><Link to="/" onClick={closeMenu} className="block hover:text-accent transition-colors">{t('navHome')}</Link></li>
            <li><Link to="/campaigns" onClick={closeMenu} className="block hover:text-accent transition-colors">{t('navCampaigns')}</Link></li>
            <li><Link to="/transparency" onClick={closeMenu} className="block hover:text-accent transition-colors">{t('navTransparency')}</Link></li>
            <li><Link to="/leaderboard" onClick={closeMenu} className="block hover:text-accent transition-colors">{t('navLeaderboard')}</Link></li>
            <li><Link to="/gallery" onClick={closeMenu} className="block hover:text-accent transition-colors">{t('navGallery')}</Link></li>
          </ul>
          
          <div className="border-t border-white/10 px-6 py-6 flex flex-col space-y-4">
            {user ? (
              <>
                {(user.role === 'SUPER_ADMIN' || user.role === 'TREASURER') && (
                  <Link to="/admin" onClick={closeMenu} className="text-accent font-bold hover:text-white transition-colors">
                    {t('navDashboard')}
                  </Link>
                )}
                <Link to="/dashboard" onClick={closeMenu} className="font-bold hover:text-accent transition-colors">
                  Hi, {user.full_name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="text-left py-2 border border-background text-background font-bold rounded hover:bg-background hover:text-primary transition-colors text-center w-full">
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={closeMenu} className="py-2 border border-background text-background font-bold text-center rounded hover:bg-background hover:text-primary transition-colors">{t('navLogin')}</Link>
                <Link to="/register" onClick={closeMenu} className="py-2 bg-accent text-text font-bold text-center rounded hover:bg-yellow-500 transition-colors">{t('navRegister')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
