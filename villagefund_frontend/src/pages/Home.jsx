import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../api/campaigns';
import CampaignCard from '../components/campaigns/CampaignCard';

export default function Home() {
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCampaigns = async () => {
      try {
        const { data } = await getCampaigns({ status: 'ACTIVE' });
        // Take only the first 3 active campaigns for the homepage
        const campaignsList = data.results || data;
        setActiveCampaigns(campaignsList.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch recent campaigns", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentCampaigns();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/90 to-orange-800 text-white overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight">
              Empowering Sundarpur, <span className="text-secondary-light block mt-2 text-green-300">Together.</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100 leading-relaxed max-w-2xl mx-auto">
              100% transparent, community-driven funding for our village's development. 
              Track every rupee and vote on the projects that matter most.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <Link 
                to="/campaigns" 
                className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-green-600 text-white font-bold rounded-full shadow-lg shadow-green-900/20 transition-transform transform hover:-translate-y-1"
              >
                View Active Projects
              </Link>
              <Link 
                to="/transparency" 
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold rounded-full transition-colors"
              >
                See Public Ledger
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved Divider at the bottom of hero */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.34,201.34,109.1,241.6,103.48,281.33,88.75,321.39,56.44Z" className="fill-background transition-colors duration-300"></path>
          </svg>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-12 bg-background relative -mt-10 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto transform -translate-y-1/2">
            <div>
              <h3 className="text-4xl font-extrabold text-primary font-heading mb-2">₹1.4L+</h3>
              <p className="text-text-muted font-medium">Total Raised</p>

            </div>
            <div className="hidden md:block w-px bg-border h-16 mx-auto"></div>
            <div>
              <h3 className="text-4xl font-extrabold text-secondary font-heading mb-2">3</h3>
              <p className="text-text-muted font-medium">Projects Funded</p>
            </div>
            <div className="hidden md:block w-px bg-border h-16 mx-auto"></div>
            <div>
              <h3 className="text-4xl font-extrabold text-blue-600 font-heading mb-2">100%</h3>
              <p className="text-text-muted font-medium">Transparency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Campaigns Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-text mb-2">Active Campaigns</h2>
              <p className="text-text-muted">Projects needing your immediate support.</p>
            </div>
            <Link to="/campaigns" className="text-primary font-bold hover:underline hidden md:block">
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : activeCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-xl shadow-sm border border-border">
              <h3 className="text-xl text-text-muted">No active campaigns right now.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/campaigns" className="text-primary font-bold hover:underline">
              View All Campaigns &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-text mb-4">Trust built through Transparency</h2>
            <p className="text-text-muted text-lg">We've redesigned how village development works by removing middlemen and adding multi-signature accountability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-text">1. Campaign Created</h3>
              <p className="text-text-muted leading-relaxed">
                Village committee proposes a project with a strict, itemized budget breakdown.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center transform -rotate-3 transition-transform hover:-rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-text">2. Direct Funding</h3>
              <p className="text-text-muted leading-relaxed">
                You contribute directly to the official village bank account via UPI. The Treasurer verifies the UTR.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-text">3. Multi-Sig Expenses</h3>
              <p className="text-text-muted leading-relaxed">
                Any expense over ₹2,000 requires multiple committee members to approve before money leaves the bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold font-heading mb-6">Ready to make an impact?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join the community of NRIs and locals working together to build a better future for Sundarpur.
          </p>
          <Link 
            to="/register" 
            className="inline-block px-10 py-4 bg-white text-secondary font-extrabold rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
