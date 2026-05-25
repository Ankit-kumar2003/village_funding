import { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Navigation
    navHome: 'Home',
    navAbout: 'About Us',
    navContact: 'Contact',
    navTransparency: 'Transparency',
    navCampaigns: 'Campaigns',
    navLeaderboard: 'Leaderboard',
    navDashboard: 'Dashboard',
    navProfile: 'Profile',
    navNotifications: 'Notifications',
    navLogin: 'Login',
    navRegister: 'Register',
    navLogout: 'Logout',

    // Footer
    footerDesc: 'Transparent community fundraising for Mahuaa, West Champaran, Bihar. Every rupee tracked.',
    footerLinks: 'Quick Links',
    footerDev: 'Developed By',

    // Home Hero
    heroTitle: 'Empowering Mahuaa,',
    heroTitleHighlight: 'Together.',
    heroSubtitle: '100% transparent, community-driven funding for our village\'s development. Track every rupee and vote on the projects that matter most.',
    heroBtnProjects: 'View Active Projects',
    heroBtnLedger: 'See Public Ledger',

    // Home Stats
    statRaised: 'Total Raised',
    statProjects: 'Projects Funded',
    statTransparency: 'Transparency',

    // Home Campaigns
    activeCampaigns: 'Active Campaigns',
    campaignsSubtitle: 'Projects needing your immediate support.',
    viewAll: 'View All',
    noCampaigns: 'No active campaigns right now.',

    // Home How It Works
    howItWorksTitle: 'Trust built through Transparency',
    howItWorksSubtitle: 'We\'ve redesigned how village development works by removing middlemen and adding multi-signature accountability.',
    step1Title: '1. Campaign Created',
    step1Desc: 'Village committee proposes a project with a strict, itemized budget breakdown.',
    step2Title: '2. Direct Funding',
    step2Desc: 'You contribute directly to the official village bank account via UPI. The Treasurer verifies the UTR.',
    step3Title: '3. Multi-Sig Expenses',
    step3Desc: 'Any expense over ₹2,000 requires multiple committee members to approve before money leaves the bank.',
    step4Title: '4. Public Accountability',
    step4Desc: 'Anyone in the village — or the world — can view the full ledger, expense receipts, audit log, and financial health score. Zero hidden transactions.',

    // Home CTA
    ctaTitle: 'Ready to make an impact?',
    ctaSubtitle: 'Join the community of NRIs and locals working together to build a better future for Mahuaa.',
    ctaBtn: 'Create Your Account',

    // About Hero
    aboutHeroBadge: 'Mahuaa · West Champaran · Bihar · PIN 845106',
    aboutHeroTitle: 'About',
    aboutHeroDesc: 'Mahuaa is a vibrant, tight-knit village community in West Champaran, Bihar, that regularly comes together to improve school facilities, install street lights, and build infrastructure. VillageFund was born to make sure every single rupee contributed is publicly accounted for — rebuilding the trust that manual collection eroded.',

    // About Geography Section
    geoBadge: 'Village Basecamp',
    geoTitle: 'Our Geographic Coordinates in',
    geoDesc: 'Mahuaa is nestled in the West Champaran district of Bihar. In order to drive complete geographic transparency, our fundraising platform maps development campaigns directly to the physical locations where they are implemented.',
    geoRegistered: 'Registered Basecamp',
    geoState: 'West Champaran, Bihar, India',

    // About Problem
    problemBadge: 'The Problem',
    problemTitle: 'Money went into one person\'s account —',
    problemHighlight: 'no records, no trust.',
    problemDesc: 'Previously, when we collected money for village festivals, temple renovations, or solar lights, it went straight into an individual\'s personal bank account. There were no digital receipts, no audit trails, and no public visibility, causing disputes and reducing contributions year after year.',
    solutionBadge: 'The Solution',
    solutionTitle: 'VillageFund makes every transaction',
    solutionHighlight: '100% transparent.',
    solutionDesc: 'With our UTR verification, double-entry ledger, and multi-sig oversight, every rupee is visible to the entire community in real-time. Trust is completely restored!',

    // Common
    loading: 'Loading...'
  },
  hi: {
    // Navigation
    navHome: 'होम',
    navAbout: 'हमारे बारे में',
    navContact: 'संपर्क करें',
    navTransparency: 'पारदर्शिता',
    navCampaigns: 'अभियान',
    navLeaderboard: 'लीडरबोर्ड',
    navDashboard: 'डैशबोर्ड',
    navProfile: 'प्रोफाइल',
    navNotifications: 'सूचनाएं',
    navLogin: 'लॉगिन',
    navRegister: 'पंजीकरण',
    navLogout: 'लॉगआउट',

    // Footer
    footerDesc: 'महुआ, पश्चिम चंपारण, बिहार के लिए पारदर्शी सामुदायिक धन संग्रह। हर रुपये पर नज़र।',
    footerLinks: 'त्वरित लिंक्स',
    footerDev: 'द्वारा विकसित',

    // Home Hero
    heroTitle: 'महुआ को सशक्त बनाना,',
    heroTitleHighlight: 'एक साथ।',
    heroSubtitle: 'हमारे गांव के विकास के लिए 100% पारदर्शी, समुदाय-संचालित योगदान। हर रुपये पर नज़र रखें और सबसे महत्वपूर्ण परियोजनाओं पर मतदान करें।',
    heroBtnProjects: 'सक्रिय परियोजनाएं देखें',
    heroBtnLedger: 'सार्वजनिक बहीखाता देखें',

    // Home Stats
    statRaised: 'कुल एकत्रित राशि',
    statProjects: 'वित्तपोषित परियोजनाएं',
    statTransparency: '100% पारदर्शिता',

    // Home Campaigns
    activeCampaigns: 'सक्रिय अभियान',
    campaignsSubtitle: 'परियोजनाएं जिन्हें आपके तत्काल समर्थन की आवश्यकता है।',
    viewAll: 'सभी देखें',
    noCampaigns: 'अभी कोई सक्रिय अभियान नहीं है।',

    // Home How It Works
    howItWorksTitle: 'पारदर्शिता से निर्मित विश्वास',
    howItWorksSubtitle: 'हमने बिचौलियों को हटाकर और बहु-हस्ताक्षर जवाबदेही जोड़कर गांव के विकास के काम करने के तरीके को फिर से डिजाइन किया है।',
    step1Title: '१. अभियान का निर्माण',
    step1Desc: 'ग्राम समिति एक सख्त, मदवार बजट विवरण के साथ एक परियोजना का प्रस्ताव करती है।',
    step2Title: '२. प्रत्यक्ष वित्तपोषण',
    step2Desc: 'आप UPI के माध्यम से सीधे आधिकारिक गांव के बैंक खाते में योगदान करते हैं। कोषाध्यक्ष UTR का सत्यापन करता है।',
    step3Title: '३. बहु-हस्ताक्षर व्यय',
    step3Desc: 'बैंक से पैसा निकलने से पहले ₹2,000 से अधिक के किसी भी खर्च को स्वीकृत करने के लिए कई समिति सदस्यों की आवश्यकता होती है।',
    step4Title: '४. सार्वजनिक जवाबदेही',
    step4Desc: 'गांव का कोई भी व्यक्ति — या दुनिया — पूर्ण बहीखाता, व्यय रसीदें, ऑडिट लॉग और वित्तीय स्वास्थ्य स्कोर देख सकता है। शून्य गुप्त लेनदेन।',

    // Home CTA
    ctaTitle: 'योगदान देने के लिए तैयार हैं?',
    ctaSubtitle: 'महुआ के बेहतर भविष्य के निर्माण के लिए मिलकर काम करने वाले प्रवासियों (NRIs) और स्थानीय लोगों के समुदाय में शामिल हों।',
    ctaBtn: 'अपना खाता बनाएं',

    // About Hero
    aboutHeroBadge: 'महुआ · पश्चिम चंपारण · बिहार · पिन 845106',
    aboutHeroTitle: 'हमारे',
    aboutHeroDesc: 'महुआ पश्चिम चंपारण, बिहार में एक जीवंत, एकजुट ग्राम समुदाय है जो स्कूल सुविधाओं में सुधार, स्ट्रीट लाइट लगाने और बुनियादी ढांचे के निर्माण के लिए नियमित रूप से एक साथ आता है। विलेजफंड का जन्म यह सुनिश्चित करने के लिए हुआ था कि योगदान किया गया एक-एक रुपया सार्वजनिक रूप से दर्ज हो — जिससे पुराना खोया हुआ विश्वास वापस आ सके।',

    // About Geography Section
    geoBadge: 'ग्राम बेसकैंप',
    geoTitle: 'महुआ में हमारी भौगोलिक स्थिति',
    geoDesc: 'महुआ बिहार के पश्चिम चंपारण जिले में स्थित है। पूर्ण भौगोलिक पारदर्शिता लाने के लिए, हमारा मंच सीधे उन भौतिक स्थानों पर अभियानों को मैप करता है जहां वे कार्यान्वित किए जा रहे हैं।',
    geoRegistered: 'पंजीकृत बेसकैंप',
    geoState: 'पश्चिम चंपारण, बिहार, भारत',

    // About Problem
    problemBadge: 'मुख्य समस्या',
    problemTitle: 'पैसा एक व्यक्ति के खाते में जाता था —',
    problemHighlight: 'कोई बहीखाता नहीं, कोई विश्वास नहीं।',
    problemDesc: 'पहले, जब हम त्योहारों, मंदिर के जीर्णोद्धार या स्ट्रीट लाइटों के लिए धन इकट्ठा करते थे, तो वह सीधे किसी व्यक्ति के निजी बैंक खाते में जाता था। कोई रसीद नहीं, कोई सार्वजनिक निगरानी नहीं होती थी, जिससे विवाद उत्पन्न होते थे और हर साल योगदान कम होता जाता था।',
    solutionBadge: 'हमारा समाधान',
    solutionTitle: 'विलेजफंड हर लेनदेन को बनाता है',
    solutionHighlight: '100% पारदर्शी।',
    solutionDesc: 'हमारे UTR सत्यापन, दोहरे बहीखाते और बहु-हस्ताक्षर पर्यवेक्षण के साथ, हर रुपया पूरी जनता को लाइव दिखाई देता है। विश्वास पूरी तरह से बहाल हो गया है!',

    // Common
    loading: 'लोड हो रहा है...'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved === 'hi' ? 'hi' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
