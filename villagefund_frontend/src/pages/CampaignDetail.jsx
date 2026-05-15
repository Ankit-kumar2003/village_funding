import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignDetail, getCampaignUpdates } from '../api/campaigns';
import ProgressBar from '../components/common/ProgressBar';
import IndianCurrency from '../components/common/IndianCurrency';
import ContributionForm from '../components/campaigns/ContributionForm';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [detailRes, updatesRes] = await Promise.all([
          getCampaignDetail(id),
          getCampaignUpdates(id)
        ]);
        setCampaign(detailRes.data);
        setUpdates(updatesRes.data.results || updatesRes.data);
      } catch (error) {
        console.error("Failed to fetch campaign details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!campaign) {
    return <div className="container mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-gray-700">Campaign not found</h2><Link to="/campaigns" className="text-primary font-medium mt-4 inline-block hover:underline">Back to Campaigns</Link></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/campaigns" className="text-sm text-gray-500 hover:text-primary mb-6 inline-block font-medium">&larr; Back to all campaigns</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-64 md:h-96 bg-gray-200 relative">
              {campaign.cover_image ? (
                <img src={campaign.cover_image} alt={campaign.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <span className="font-heading text-2xl font-medium">No Image Available</span>
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <h1 className="text-3xl font-bold font-heading text-text mb-2 md:mb-0">{campaign.title}</h1>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                  {campaign.category}
                </span>
              </div>
              
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{campaign.description}</p>
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          {campaign.budget_items && campaign.budget_items.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold font-heading mb-6 border-b pb-4 text-text">Budget Breakdown</h2>
              <div className="space-y-4">
                {campaign.budget_items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700 font-medium">{item.item_name}</span>
                    <span className="font-bold text-text"><IndianCurrency amount={item.estimated_cost} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updates */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold font-heading mb-6 border-b pb-4 text-text">Campaign Updates</h2>
            {updates.length === 0 ? (
              <p className="text-gray-500 italic">No updates posted yet.</p>
            ) : (
              <div className="space-y-8">
                {updates.map(update => (
                  <div key={update.id} className="border-l-4 border-primary pl-5 py-1">
                    <h4 className="font-bold text-xl text-text mb-1">{update.title}</h4>
                    <p className="text-sm text-gray-500 mb-4 font-medium">{new Date(update.posted_at).toLocaleDateString()}</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{update.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-6">
                <div className="text-4xl font-bold text-text mb-2 tracking-tight">
                  <IndianCurrency amount={campaign.raised_amount} />
                </div>
                <div className="text-gray-500 mb-5 text-sm">
                  raised of <span className="font-bold text-text"><IndianCurrency amount={campaign.goal_amount} /></span> goal
                </div>
                <ProgressBar percentage={campaign.progress_percentage} />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-md border border-gray-100">
                <span className={`font-bold px-2 py-1 rounded text-xs ${
                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
                <span className="font-medium">Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>
              </div>

              <ContributionForm campaignId={campaign.id} qrImage={campaign.campaign_qr_image} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
              <h3 className="font-bold font-heading mb-4 text-lg">Transparency Info</h3>
              <ul className="text-sm space-y-3 text-gray-600">
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium text-text">Created By</span> 
                  <span>{campaign.created_by?.full_name || 'Village Committee'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium text-text">Treasurer</span> 
                  <span>{campaign.treasurer?.full_name || 'Pending'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
