import { Link } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import IndianCurrency from '../common/IndianCurrency';
import { useLanguage } from '../../context/LanguageContext';

export default function CampaignCard({ campaign }) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden border border-border transition-transform hover:-translate-y-1 hover:shadow-lg text-text">
      <div className="h-48 bg-background relative">
        {campaign.cover_image ? (
          <img src={campaign.cover_image} alt={campaign.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <span className="font-heading font-medium">{t('noImage')}</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-surface/90 dark:bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-secondary dark:text-primary border border-border">
          {campaign.category}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold font-heading mb-2 line-clamp-1" title={campaign.title}>
          {campaign.title}
        </h3>
        
        <div className="mt-4 mb-2">
          <ProgressBar percentage={campaign.progress_percentage} />
        </div>
        
        <div className="flex justify-between text-sm mt-2 mb-6">
          <div>
            <span className="block text-text-muted">{t('raised')}</span>
            <span className="font-bold text-text"><IndianCurrency amount={campaign.raised_amount} /></span>
          </div>
          <div className="text-right">
            <span className="block text-text-muted">{t('goal')}</span>
            <span className="font-bold text-text"><IndianCurrency amount={campaign.goal_amount} /></span>
          </div>
        </div>

        <Link 
          to={`/campaigns/${campaign.id}`} 
          className="block w-full text-center bg-primary text-white py-2 rounded-md font-medium hover:bg-orange-600 transition-colors"
        >
          {t('viewDetails')}
        </Link>
      </div>
    </div>
  );
}
