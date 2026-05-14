import { useEffect, useState } from 'react';
import { getCampaigns } from '../api/campaigns';
import CampaignCard from '../components/campaigns/CampaignCard';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const params = filter !== 'ALL' ? { status: filter } : {};
        const { data } = await getCampaigns(params);
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-primary mb-4 md:mb-0">Village Campaigns</h1>
        
        <div className="flex space-x-2">
          {['ALL', 'ACTIVE', 'FUNDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-secondary text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-heading text-gray-500">No campaigns found</h3>
          <p className="text-gray-400 mt-2">Check back later or start a new campaign.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
