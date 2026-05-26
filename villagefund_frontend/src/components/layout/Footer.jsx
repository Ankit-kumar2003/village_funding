import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-text text-background py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-heading font-bold text-primary mb-4">VillageFund</h3>
          <p className="text-sm text-gray-400">
            {t('footerDesc')}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t('footerLinks')}</h4>
          <ul className="space-y-2 text-sm text-gray-400 font-semibold">
            <li><a href="/about" className="hover:text-accent">{t('navAbout')}</a></li>
            <li><a href="/transparency" className="hover:text-accent">{t('navTransparency')}</a></li>
            <li><a href="/contact" className="hover:text-accent">{t('navContact')}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">{t('footerDev')}</h4>
          <p className="text-sm text-gray-400 font-semibold">
            {t('footerDevName')}<br/>
            {t('footerDevRole')}<br/>
            {t('footerDevCollege')}
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-700">
        &copy; {new Date().getFullYear()} VillageFund. {t('footerRights')}
      </div>
    </footer>
  );
}
