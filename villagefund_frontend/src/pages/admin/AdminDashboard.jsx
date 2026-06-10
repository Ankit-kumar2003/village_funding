import { useEffect, useState, useContext } from 'react';
import { getAllContributions, approveContribution, rejectContribution } from '../../api/contributions';
import { getExpenses, approveExpense } from '../../api/expenses';
import { getCampaigns, deleteCampaign } from '../../api/campaigns';
import { getGallery, deleteFromGallery } from '../../api/gallery';
import IndianCurrency from '../../components/common/IndianCurrency';
import ExpenseForm from '../../components/admin/ExpenseForm';
import CampaignForm from '../../components/admin/CampaignForm';
import GalleryUploadForm from '../../components/admin/GalleryUploadForm';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('contributions');
  
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contributions') {
        const { data } = await getAllContributions({ status: 'PENDING' });
        setContributions(data.results || data);
      } else if (activeTab === 'expenses') {
        const { data } = await getExpenses();
        setExpenses(data.results || data);
      } else if (activeTab === 'campaigns') {
        const { data } = await getCampaigns();
        setCampaignsList(data.results || data);
      } else if (activeTab === 'gallery') {
        const { data } = await getGallery();
        setGalleryList(data.results || data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setEditingCampaign(null);
  }, [activeTab]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (activeTab === 'contributions') {
        if (action === 'APPROVE') await approveContribution(id);
        else await rejectContribution(id);
      } else {
        if (action === 'APPROVE_EXPENSE') await approveExpense(id);
      }
      fetchData();
    } catch (error) {
      alert("Action failed. Check console.");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (id) => {
    const message = language === 'en' 
      ? "Are you sure you want to delete this campaign? This cannot be undone." 
      : "क्या आप वाकई इस अभियान को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।";
    if (!window.confirm(message)) return;
    
    try {
      await deleteCampaign(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? "Failed to delete campaign." : "अभियान हटाने में विफल।");
    }
  };

  const handleDeleteGalleryPhoto = async (id) => {
    const message = language === 'en' 
      ? "Are you sure you want to delete this gallery photo?" 
      : "क्या आप वाकई इस गैलरी फोटो को हटाना चाहते हैं?";
    if (!window.confirm(message)) return;
    
    try {
      await deleteFromGallery(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? "Failed to delete gallery photo." : "गैलरी फोटो हटाने में विफल।");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-text">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">
          {language === 'en' ? 'Treasurer Dashboard' : 'कोषाध्यक्ष डैशबोर्ड'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border mb-6">
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'contributions' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          {language === 'en' ? 'Pending Contributions' : 'लंबित योगदान'}
        </button>
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          {language === 'en' ? 'Manage Expenses' : 'खर्चों का प्रबंधन'}
        </button>
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'campaigns' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
          onClick={() => setActiveTab('campaigns')}
        >
          {language === 'en' ? 'Manage Campaigns' : 'अभियान प्रबंधन'}
        </button>
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          {language === 'en' ? 'Manage Gallery' : 'गैलरी प्रबंधन'}
        </button>
      </div>

      {activeTab === 'contributions' ? (
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading text-text">
              {language === 'en' ? 'Pending Approvals' : 'लंबित स्वीकृतियां'}
            </h2>
            <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400 border border-orange-200/20 dark:border-orange-900/30 text-xs font-bold px-3 py-1 rounded-full">
              {contributions.length} {language === 'en' ? 'Actions Required' : 'कार्रवाई आवश्यक'}
            </span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-text-muted">{language === 'en' ? 'Loading pending contributions...' : 'लंबित योगदान लोड हो रहे हैं...'}</div>
          ) : contributions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-heading text-text font-bold mb-2">{language === 'en' ? 'All Caught Up!' : 'सब काम हो गया!'}</h3>
              <p className="text-text-muted">{language === 'en' ? 'There are no pending contributions to review right now.' : 'अभी समीक्षा के लिए कोई लंबित योगदान नहीं है।'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                    <th className="p-4 font-medium">{language === 'en' ? 'Contributor' : 'योगदानकर्ता'}</th>
                    <th className="p-4 font-medium">{language === 'en' ? 'Campaign ID' : 'अभियान ID'}</th>
                    <th className="p-4 font-medium">{language === 'en' ? 'Amount' : 'राशि'}</th>
                    <th className="p-4 font-medium">{language === 'en' ? 'UTR Number' : 'UTR नंबर'}</th>
                    <th className="p-4 font-medium">{language === 'en' ? 'Date' : 'दिनांक'}</th>
                    <th className="p-4 font-medium text-right">{language === 'en' ? 'Actions' : 'कार्रवाई'}</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text">
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background/40">
                      <td className="p-4">
                        <div className="font-medium text-text">{c.contributor_name}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-primary" title={c.campaign}>{c.campaign.substring(0,8)}...</td>
                      <td className="p-4 font-bold text-text"><IndianCurrency amount={c.amount} /></td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-background text-text rounded px-2 py-1 inline-block border border-border font-bold">
                          {c.utr_number}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted whitespace-nowrap">{new Date(c.submitted_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleAction(c.id, 'APPROVE')}
                          disabled={actionLoading === c.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === c.id ? '...' : (language === 'en' ? 'Verify & Approve' : 'सत्यापित और स्वीकृत करें')}
                        </button>
                        <button 
                          onClick={() => handleAction(c.id, 'REJECT')}
                          disabled={actionLoading === c.id}
                          className="bg-background text-red-650 dark:text-red-400 border border-red-200/20 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/25 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {language === 'en' ? 'Reject' : 'अस्वीकार करें'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'expenses' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ExpenseForm onExpenseAdded={fetchData} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading text-text">
                  {language === 'en' ? 'Expense Ledger' : 'खर्च बही'}
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-text-muted">{language === 'en' ? 'Loading expenses...' : 'खर्च लोड हो रहे हैं...'}</div>
              ) : expenses.length === 0 ? (
                <div className="p-12 text-center text-text-muted">{language === 'en' ? 'No expenses logged yet.' : 'अभी तक कोई खर्च दर्ज नहीं किया गया है।'}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                        <th className="p-4 font-medium">{language === 'en' ? 'Expense' : 'खर्च'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Amount' : 'राशि'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Status / Approvals' : 'स्थिति / स्वीकृतियां'}</th>
                        <th className="p-4 font-medium text-right">{language === 'en' ? 'Action' : 'कार्रवाई'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text">
                      {expenses.map((exp) => {
                        const hasApproved = exp.approvals?.some(a => a.approved_by === user.id);
                        return (
                          <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-background/40">
                            <td className="p-4">
                              <div className="font-bold text-text mb-1">{exp.description}</div>
                              <div className="text-xs text-text-muted">Campaign: {exp.campaign_title || exp.campaign.substring(0,8)}...</div>
                              <div className="text-xs text-text-muted mt-1">Category: {exp.category}</div>
                            </td>
                            <td className="p-4 font-bold text-text"><IndianCurrency amount={exp.amount} /></td>
                            <td className="p-4">
                              <div className={`text-xs font-bold px-2 py-1 rounded inline-block border ${
                                exp.approval_status === 'APPROVED' 
                                  ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/40' 
                                  : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30'
                              }`}>
                                {exp.approval_status}
                              </div>
                              {exp.requires_multi_sig && exp.approval_status === 'PENDING' && (
                                <div className="text-xs text-text-muted mt-2">
                                  {exp.approval_count} / 2 {language === 'en' ? 'Approvals Required' : 'स्वीकृतियां आवश्यक'}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {exp.approval_status === 'PENDING' && !hasApproved && user.role === 'SUPER_ADMIN' ? (
                                <button 
                                  onClick={() => handleAction(exp.id, 'APPROVE_EXPENSE')}
                                  disabled={actionLoading === exp.id}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === exp.id ? '...' : (language === 'en' ? 'Approve (Multi-Sig)' : 'स्वीकृत करें (मल्टी-सिग)')}
                                </button>
                              ) : exp.approval_status === 'PENDING' && hasApproved ? (
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">{language === 'en' ? 'You Approved' : 'आपने स्वीकृत किया'}</span>
                              ) : exp.approval_status === 'APPROVED' ? (
                                <span className="text-xs text-text-muted opacity-60">{language === 'en' ? 'Complete' : 'पूर्ण'}</span>
                              ) : (
                                <span className="text-xs text-text-muted opacity-60">{language === 'en' ? 'Waiting on Admin' : 'एडमिन की प्रतीक्षा है'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'campaigns' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CampaignForm 
              onCampaignAdded={() => {
                fetchData();
                setEditingCampaign(null);
              }}
              campaignToEdit={editingCampaign}
              onCancel={() => setEditingCampaign(null)}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading text-text">
                  {language === 'en' ? 'Active Campaigns' : 'सक्रिय अभियान'}
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-text-muted">{language === 'en' ? 'Loading campaigns...' : 'अभियान लोड हो रहे हैं...'}</div>
              ) : campaignsList.length === 0 ? (
                <div className="p-12 text-center text-text-muted">{language === 'en' ? 'No campaigns launched yet.' : 'अभी तक कोई अभियान शुरू नहीं किया गया है।'}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                        <th className="p-4 font-medium">{language === 'en' ? 'Cover' : 'कवर'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Title' : 'शीर्षक'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Goal' : 'लक्ष्य'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Raised' : 'प्राप्त राशि'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Status' : 'स्थिति'}</th>
                        <th className="p-4 font-medium text-right">{language === 'en' ? 'Action' : 'कार्रवाई'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text">
                      {campaignsList.map((camp) => (
                        <tr key={camp.id} className="border-b border-border last:border-0 hover:bg-background/40">
                          <td className="p-4">
                            <div className="w-12 h-10 rounded overflow-hidden border border-border bg-background">
                              {camp.cover_image ? (
                                <img src={camp.cover_image} alt={camp.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted font-bold uppercase">No image</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-text mb-0.5">{camp.title}</div>
                            <div className="text-xs text-text-muted">Category: {camp.category}</div>
                          </td>
                          <td className="p-4 font-bold text-text"><IndianCurrency amount={camp.goal_amount} /></td>
                          <td className="p-4 font-bold text-text"><IndianCurrency amount={camp.raised_amount} /></td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              camp.status === 'ACTIVE' 
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/40' 
                                : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30'
                            }`}>
                              {camp.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-3 whitespace-nowrap">
                            <button 
                              onClick={() => {
                                setEditingCampaign(camp);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-primary hover:text-orange-600 font-bold text-xs p-1"
                              title="Edit Campaign"
                            >
                              {language === 'en' ? 'Edit' : 'संपादित करें'}
                            </button>
                            {user.role === 'SUPER_ADMIN' ? (
                              <button 
                                onClick={() => handleDeleteCampaign(camp.id)}
                                className="text-red-650 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-xs p-1 border-l border-border pl-3"
                                title="Delete Campaign"
                              >
                                {language === 'en' ? 'Delete' : 'हटाएं'}
                              </button>
                            ) : (
                              <span className="text-xs text-text-muted opacity-50 border-l border-border pl-3" title="Only Super Admin can delete campaigns">
                                {language === 'en' ? 'Locked' : 'लॉक है'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <GalleryUploadForm onPhotoAdded={fetchData} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-background/50 flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading text-text">
                  {language === 'en' ? 'Gallery Photos' : 'गैलरी तस्वीरें'}
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-text-muted">{language === 'en' ? 'Loading photos...' : 'फोटो लोड हो रहे हैं...'}</div>
              ) : galleryList.length === 0 ? (
                <div className="p-12 text-center text-text-muted">{language === 'en' ? 'No photos uploaded yet.' : 'अभी तक कोई फोटो अपलोड नहीं की गई है।'}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                        <th className="p-4 font-medium">{language === 'en' ? 'Photo' : 'फोटो'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Caption' : 'कैप्शन'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Category' : 'श्रेणी'}</th>
                        <th className="p-4 font-medium">{language === 'en' ? 'Featured' : 'विशेष रूप से प्रदर्शित'}</th>
                        <th className="p-4 font-medium text-right">{language === 'en' ? 'Action' : 'कार्रवाई'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text">
                      {galleryList.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-background/40">
                          <td className="p-4">
                            <div className="w-12 h-10 rounded overflow-hidden border border-border bg-background">
                              {item.photo ? (
                                <img src={item.photo} alt={item.caption} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted font-bold uppercase">No image</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-text line-clamp-1" title={item.caption}>{item.caption}</div>
                            {item.campaign_title && (
                              <div className="text-xs text-text-muted line-clamp-1">Campaign: {item.campaign_title}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold text-text-muted uppercase">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              item.is_featured 
                                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40' 
                                : 'bg-gray-50 dark:bg-slate-800 text-text-muted border-border'
                            }`}>
                              {item.is_featured ? (language === 'en' ? 'Yes' : 'हाँ') : (language === 'en' ? 'No' : 'नहीं')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDeleteGalleryPhoto(item.id)}
                              className="text-red-650 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-xs p-1"
                              title="Delete Photo"
                            >
                              {language === 'en' ? 'Delete' : 'हटाएं'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
