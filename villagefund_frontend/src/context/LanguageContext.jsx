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
    navGallery: 'Gallery',
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
    footerDevName: 'Ankit',
    footerDevRole: 'B.Tech CSE 2026',
    footerDevCollege: 'MM Engineering College, Mullana',
    footerRights: 'All rights reserved.',

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

    // About Team
    aboutTeamBadge: 'The Team',
    aboutTeamTitle: 'Village Committee & Builder',
    aboutTeamSubtitle: 'Meet the people making transparent governance a reality in Mahuaa.',
    aboutTeamRole1: 'Platform Creator & Developer',
    aboutTeamDesc1: 'B.Tech CSE 2026, MM Engineering College, Mullana, Haryana',
    aboutTeamRole2: 'Active Treasurer',
    aboutTeamDesc2: 'Manages all campaigns, verifies contributions, and posts expenses with receipts.',
    aboutTeamRole3: 'Super Admin & Oversight',
    aboutTeamDesc3: 'Approves multi-signature expenses, manages roles, and maintains the audit log.',

    // About Values
    aboutValuesBadge: 'Core Values',
    aboutValuesTitle: 'What We Stand For',
    aboutValuesSubtitle: 'Every decision we make is guided by these core principles that define transparent community governance.',

    // About Tech Credits
    aboutBuiltWith: 'Built with ❤️ for Mahuaa',
    aboutBuiltByLabel: 'This platform was designed and developed by',
    aboutBuiltByName: 'Ankit Kumar',
    aboutBuiltByRole: 'B.Tech CSE 2026 · MM Engineering College, Mullana, Haryana',
    aboutTechStack: 'Built with Django · React · Tailwind CSS · Cashfree · Cloudinary · Vercel · Railway',

    // About CTA
    aboutCtaTitle: 'Ready to support your village?',
    aboutCtaSubtitle: 'Join Mahuaa\'s transparent community fundraising platform — every contribution matters, and every rupee is tracked.',
    aboutCtaBtnCampaigns: 'Explore Campaigns',
    aboutCtaBtnTransparency: 'View Transparency',

    // Common
    loading: 'Loading...',
    raised: 'Raised',
    goal: 'Goal',
    raisedOf: 'raised of',
    viewDetails: 'View Details',
    noImage: 'No Image',
    noImageAvailable: 'No Image Available',
    backToAll: '← Back to all campaigns',

    // Contact Page
    contactGetInTouch: 'Get In Touch',
    contactTitle: 'Community Contact Center',
    contactSubtitle: 'Have questions about contributions, need help with campaign creation, or want to suggest village improvements? We are here to help.',
    contactDirectTitle: 'Direct Connections',
    contactDirectSubtitle: 'Feel free to contact the organizing committee, reach out to active Treasurers, or visit our office at the Panchayat Bhavan.',
    contactAddressTitle: 'Village Address',
    contactAddressText: 'Panchayat Bhavan, Mahuaa, West Champaran District, Bihar — 845106',
    contactEmailTitle: 'Email Support',
    contactWhatsAppTitle: 'Active Treasurer (WhatsApp)',
    contactWhatsAppText: 'Instantly connect with our active treasurer on WhatsApp for swift payment doubts.',
    contactWhatsAppBtn: 'Chat on WhatsApp',
    contactDevTag: 'Developed for the community by the MM Engineering College B.Tech CSE Team.',
    contactFormTitle: 'Send a Message',
    contactFormFieldsHelp: 'Fields marked with * are mandatory.',
    contactFormName: 'Full Name',
    contactFormPhone: 'Phone Number',
    contactFormEmail: 'Email Address',
    contactFormEmailOptional: '(Optional)',
    contactFormReason: 'Reason for Inquiry',
    contactFormMsg: 'Message',
    contactFormMsgPlaceholder: 'Write your query or campaign suggestion here...',
    contactFormBtn: 'Submit Message',
    contactFaqTitle: 'Frequently Asked Questions',
    contactFaqSubtitle: 'Quick answers regarding safety, payments, transparent receipts, NRI status, and roles.',
    contactSuccessTitle: 'Message Submitted!',
    contactSuccessDesc: 'Thank you for contacting us. Your message has been safely received, and our Panchayat admins will look into it shortly.',
    contactSuccessBtn: 'Send Another Message',
    contactCatGeneral: 'General Query',
    contactCatIssue: 'Report Issue',
    contactCatSuggest: 'Suggest Campaign',
    contactCatTechnical: 'Technical Problem',

    faq1Q: 'How do I know my money reached the right place?',
    faq1A: 'Every single transaction on VillageFund is logged publicly. When you contribute, your money goes directly into the designated campaign account, and the transaction status can be tracked in real-time. All expenses must be submitted by the Treasurer with digital receipts, which you can view at any time under the \'Transparency\' tab or the campaign page.',
    faq2Q: 'Can I contribute if I live outside the village (NRI)?',
    faq2A: 'Yes, absolutely! NRIs and community members living outside the village are welcome to support development works. If you are an NRI contributor, you can request a GUEST_CONTRIBUTOR upgrade from the Super Admin to submit online payments securely through our Cashfree payment gateway.',
    faq3Q: 'How long does contribution approval take?',
    faq3A: 'Since we\'ve integrated the automated Cashfree payment gateway, payment verifications occur in real-time. Once the transaction completes, your contribution status will change to APPROVED almost instantly. Manual or pending checkouts are auto-polled and resolved within a few minutes.',
    faq4Q: 'Who can create a campaign?',
    faq4A: 'Campaigns can only be created by designated Treasurers or Super Admins after the village committee approves the development work or cultural event. However, any Contributor can use our contact form to suggest new campaigns!',
    faq5Q: 'What if a campaign doesn\'t reach its goal?',
    faq5A: 'If a campaign fails to reach its funding target by the deadline, the village committee meets to decide whether to extend the duration, proceed with a scaled-down version of the project, or refund the contributions to the Village Reserve Fund for future development.',
    faq6Q: 'How do I become a Treasurer?',
    faq6A: 'Treasurers are nominated and approved by the village Panchayat or organizing committee. Once nominated, the Super Admin will upgrade your platform account role, granting you permissions to initialize campaigns, manage budgets, and post expenses.',
    faq7Q: 'Is my contribution data visible to everyone?',
    faq7A: 'To ensure complete transparency, contributor names, amounts, and dates are public. However, sensitive billing details, full phone numbers, and transaction IDs are securely masked to maintain privacy and security.',
    faq8Q: 'How do I report a suspicious expense?',
    faq8A: 'If you notice an expense listed without a valid receipt photo or suspect it is inflated, you can click the \'Flag\' icon on that specific expense card from the campaign or transparency page. This raises an alert that is immediately investigated by the Super Admin.',

    // Campaigns Page
    campaignsPageTitle: 'Village Campaigns',
    campaignFilterAll: 'All',
    campaignFilterActive: 'ACTIVE',
    campaignFilterFunded: 'FUNDED',
    campaignNoneFound: 'No campaigns found',
    campaignNoneFoundDesc: 'Check back later or start a new campaign.',

    // Campaign Detail
    campaignNotFound: 'Campaign not found',
    backToCampaigns: 'Back to Campaigns',
    budgetBreakdown: 'Budget Breakdown',
    campaignUpdates: 'Campaign Updates',
    noUpdatesYet: 'No updates posted yet.',
    ends: 'Ends',
    transparencyInfo: 'Transparency Info',
    createdBy: 'Created By',
    treasurer: 'Treasurer',
    villageCommittee: 'Village Committee',
    pending: 'Pending',

    // Contribution Form
    makeContribution: 'Make a Contribution',
    loginToContribute: 'log in',
    loginToContributePrefix: 'Please',
    loginToContributeSuffix: 'to contribute.',
    amountLabel: 'Amount (₹)',
    noteLabel: 'Note (Optional)',
    payNow: 'Pay Now',
    redirectingToCheckout: 'Redirecting to Checkout...',
    paymentSessionError: 'Payment session could not be initialized.',
    paymentInitError: 'Failed to initiate payment. Please check your details.',
    paymentMethodLabel: 'Select Payment Method',
    payOnline: 'Online Payment (Cashfree)',
    payManual: 'Direct UPI Transfer (Manual UTR Verification)',
    upiInstructions: 'Scan the QR code or copy the UPI ID below to make the transfer from any UPI app (GPay, PhonePe, Paytm), then paste your 12-digit UTR/Transaction ID below to submit.',
    upiIdLabel: 'Campaign UPI ID',
    copySuccess: 'Copied to clipboard!',
    utrLabel: 'UTR / Transaction ID (12 digits)',
    submitManualPay: 'Submit Manual Contribution',
    submittingManualPay: 'Submitting Request...',
    manualSuccessMsg: 'Contribution request submitted successfully! Once the Treasurer verifies the transaction in the bank statement, it will be approved.',

    // Leaderboard
    leaderboardTitle: 'Village Honor Roll',
    leaderboardSubtitle: 'Recognizing the community heroes driving Mahuaa\'s growth.',
    tabContributors: 'Top Contributors',
    tabStreaks: 'Active Streaks',
    colRank: 'Rank',
    colContributor: 'Contributor',
    colVillage: 'Village/Region',
    colTotalAmount: 'Total Amount',
    colCurrentStreak: 'Current Streak',
    leaderboardEmpty: 'No data available yet. Start contributing to be the first!',
    leaderboardCtaTitle: 'Want to see your name here?',
    leaderboardCtaDesc: 'Every contribution, big or small, helps us build a stronger village together.',
    contributeNow: 'Contribute Now',

    // Transparency Page
    transparencyTitle: 'Public Ledger',
    transparencyDesc: 'We believe in 100% transparency. Every rupee contributed to the village fund is tracked here, and every major expense requires multi-signature approval from the village committee.',
    totalRaisedLabel: 'Total Raised',
    totalSpentLabel: 'Total Spent',
    villageReserve: 'Village Reserve',
    approvedExpensesTitle: 'Approved Expenses Register',
    noExpensesApproved: 'No expenses have been approved yet.',
    colDate: 'Date',
    colExpenseDetails: 'Expense Details',
    colAmount: 'Amount',
    forCampaign: 'For',
    multiSigVerified: 'Multi-Sig Verified',

    // Gallery
    galleryTitle: 'Village Progress Gallery',
    gallerySubtitle: 'Witness the transformation of Mahuaa through the eyes of our community.',
    galleryFilterAll: 'All Photos',
    galleryFilterBefore: 'Before',
    galleryFilterDuring: 'During',
    galleryFilterAfter: 'After',
    galleryFilterEvents: 'Events',
    galleryEmpty: 'No photos found in this category yet. Proof of progress will be uploaded here as projects move forward!',
    galleryGeneral: 'General Development',

    // Profile
    profileNriTag: 'NRI SUPPORTER 🌐',
    profileContribRank: 'Contribution Rank',
    profileBadgesWon: 'Badges Won',
    profileTotalInvested: 'Total Invested',
    profileProjectsBacked: 'Projects Backed',
    profileActiveStreak: 'Active Streak',
    profileLongestStreak: 'Longest Streak',
    profileCampaignUnit: 'Campaign',
    profileTabContributions: 'My Contributions',
    profileTabBadges: 'Badges & Achievements',
    profileTabPledges: 'Pledge Tracker',
    profileContribLog: 'Contributions Log',
    profileDownloadPdf: 'Download Summary PDF',
    profileNoContrib: 'No contributions found on this account.',
    profileColDate: 'Submitted Date',
    profileColCampaignId: 'Campaign ID',
    profileColAmount: 'Amount',
    profileColUtr: 'Transaction Reference (UTR)',
    profileColStatus: 'Status',
    profileLoadingItems: 'Loading profile items...',
    profileBadgesTitle: 'Gamification Showcase',
    profileBadgesDesc: 'Unlock badges by supporting village initiatives and completing consecutive contribution streaks.',
    profileNoBadges: 'No badge configurations found on the backend.',
    profileBadgeEarned: 'Earned',
    profilePledgesTitle: 'Monthly Contribution Pledges',
    profilePledgesDesc: 'Commit to supporting village infrastructure and welfare projects by setting up monthly installment pledges. Perfect for NRIs who wish to consistently support their homeland.',
    profileActivePledge: 'Active Pledge',
    profileActive: 'Active',
    profileCampaignTarget: 'Campaign Target',
    profileInstallment: 'Installment',
    profileNextDueDate: 'Next Due Date',
    profilePayInstallment: 'Pay Installment',
    profileCancelPledge: 'Cancel Pledge',

    // Dashboard
    dashboardTitle: 'My Dashboard',
    dashboardWelcome: 'Welcome back,',
    dashboardAdminPanel: 'Go to Admin Panel',
    dashboardTotalContributed: 'Total Contributed',
    dashboardActiveStreak: 'Active Streak',
    dashboardMonths: 'Months',
    dashboardBadgesEarned: 'Badges Earned',
    dashboardContribHistory: 'My Contributions History',
    dashboardNoContrib: 'You haven\'t made any contributions yet.',
    dashboardExploreCampaigns: 'Explore Campaigns',
    dashboardColDate: 'Date',
    dashboardColCampaignId: 'Campaign ID',
    dashboardColAmount: 'Amount',
    dashboardColUtr: 'Transaction ID / UTR',
    dashboardColStatus: 'Status',

    // Notifications
    notifTitle: 'Notification Hub',
    notifNew: 'New',
    notifSubtitle: 'Stay updated with campaigns, milestones, and expense approvals in Mahuaa.',
    notifMarkAllRead: 'Mark All as Read',
    notifLoading: 'Loading your notifications...',
    notifNone: 'No notifications yet',
    notifNoneDesc: 'We will notify you when new campaigns launch, or when your payments are approved!',
    notifViewCampaign: 'View Campaign',
    notifMarkRead: 'Mark as read',

    // Login
    loginTitle: 'Welcome Back',
    loginPhone: 'Phone Number',
    loginPassword: 'Password',
    loginBtn: 'Login',
    loginOr: 'or',
    loginNoAccount: 'Don\'t have an account?',
    loginRegisterLink: 'Register here',
    loginInvalidCreds: 'Invalid credentials',
    loginGoogleFailed: 'Google login failed',

    // Register
    registerTitle: 'Join VillageFund',
    registerName: 'Full Name',
    registerEmail: 'Email Address (Optional)',
    registerPhone: 'Phone Number',
    registerPassword: 'Password',
    registerConfirmPassword: 'Confirm Password',
    registerBtn: 'Register',
    registerHaveAccount: 'Already have an account?',
    registerLoginLink: 'Log in here',
    registerPasswordMismatch: 'Passwords do not match',
    registerFailed: 'Registration failed. Please check your details.',

    // Thank You
    thankYouTitle: 'Thank You!',
    thankYouDesc: 'Your contribution has been successfully submitted. It is currently',
    thankYouPending: 'PENDING',
    thankYouDescSuffix: 'review. Once the village treasurer verifies the UTR/Transaction ID with the bank statement, it will be marked as APPROVED and added to the campaign total.',
    thankYouDashboard: 'Go to My Dashboard',
    thankYouExplore: 'Explore More Campaigns',

    // Payment Status
    paymentVerifying: 'Verifying Payment',
    paymentVerifyingDesc: 'Please wait while we secure confirmation from the bank...',
    paymentAttempt: 'Attempt',
    paymentAttemptOf: 'of',
    paymentSuccess: 'Payment Successful!',
    paymentSuccessDesc: 'Thank you for your generous support! Your contribution of',
    paymentSuccessDescSuffix: 'has been received and credited to the campaign.',
    paymentOrderId: 'Order ID',
    paymentPending: 'Verification Pending',
    paymentPendingDesc: 'Your payment transaction is taking a bit longer to be acknowledged by the bank. Don\'t worry, your dashboard will reflect the updated status automatically within a few minutes.',
    paymentFailed: 'Payment Failed',
    paymentFailedDesc: 'The payment request was unsuccessful or cancelled. No funds have been deducted from your account. Please try again or get in touch if you face further issues.',
    paymentAllCampaigns: 'All Campaigns',
    paymentMyDashboard: 'My Dashboard',
  },
  hi: {
    // Navigation
    navHome: 'होम',
    navAbout: 'हमारे बारे में',
    navContact: 'संपर्क करें',
    navTransparency: 'पारदर्शिता',
    navCampaigns: 'अभियान',
    navLeaderboard: 'लीडरबोर्ड',
    navGallery: 'गैलरी',
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
    footerDevName: 'अंकित',
    footerDevRole: 'बी.टेक सीएसई 2026',
    footerDevCollege: 'एमएम इंजीनियरिंग कॉलेज, मुल्लाना',
    footerRights: 'सर्वाधिकार सुरक्षित।',

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

    // About Team
    aboutTeamBadge: 'हमारी टीम',
    aboutTeamTitle: 'ग्राम समिति और निर्माता',
    aboutTeamSubtitle: 'महुआ में पारदर्शी शासन को वास्तविकता बनाने वाले लोगों से मिलें।',
    aboutTeamRole1: 'प्लेटफ़ॉर्म निर्माता एवं डेवलपर',
    aboutTeamDesc1: 'बी.टेक सीएसई 2026, एमएम इंजीनियरिंग कॉलेज, मुल्लाना, हरियाणा',
    aboutTeamRole2: 'सक्रिय कोषाध्यक्ष',
    aboutTeamDesc2: 'सभी अभियानों का प्रबंधन, योगदान की पुष्टि, और रसीदों के साथ खर्चों की पोस्टिंग।',
    aboutTeamRole3: 'सुपर एडमिन एवं निरीक्षण',
    aboutTeamDesc3: 'बहु-हस्ताक्षर खर्चों को मंजूरी, भूमिकाओं का प्रबंधन, और ऑडिट लॉग का रखरखाव।',

    // About Values
    aboutValuesBadge: 'मूल सिद्धांत',
    aboutValuesTitle: 'हम किसके लिए खड़े हैं',
    aboutValuesSubtitle: 'हमारा हर निर्णय इन मूल सिद्धांतों द्वारा निर्देशित होता है जो पारदर्शी सामुदायिक शासन को परिभाषित करते हैं।',

    // About Tech Credits
    aboutBuiltWith: 'महुआ के लिए ❤️ से बनाया गया',
    aboutBuiltByLabel: 'यह प्लेटफ़ॉर्म डिज़ाइन और विकसित किया गया है',
    aboutBuiltByName: 'अंकित कुमार',
    aboutBuiltByRole: 'बी.टेक सीएसई 2026 · एमएम इंजीनियरिंग कॉलेज, मुल्लाना, हरियाणा',
    aboutTechStack: 'Django · React · Tailwind CSS · Cashfree · Cloudinary · Vercel · Railway के साथ निर्मित',

    // About CTA
    aboutCtaTitle: 'अपने गाँव का समर्थन करने के लिए तैयार हैं?',
    aboutCtaSubtitle: 'महुआ के पारदर्शी सामुदायिक धन संग्रह मंच से जुड़ें — हर योगदान मायने रखता है, और हर रुपये पर नज़र रखी जाती है।',
    aboutCtaBtnCampaigns: 'अभियान देखें',
    aboutCtaBtnTransparency: 'पारदर्शिता देखें',

    // Common
    loading: 'लोड हो रहा है...',
    raised: 'एकत्रित',
    goal: 'लक्ष्य',
    raisedOf: 'एकत्रित, लक्ष्य',
    viewDetails: 'विवरण देखें',
    noImage: 'कोई चित्र नहीं',
    noImageAvailable: 'कोई चित्र उपलब्ध नहीं',
    backToAll: '← सभी अभियानों पर वापस जाएं',

    // Contact Page
    contactGetInTouch: 'संपर्क करें',
    contactTitle: 'सामुदायिक संपर्क केंद्र',
    contactSubtitle: 'योगदान के बारे में प्रश्न हैं, अभियान निर्माण में सहायता चाहिए, या गाँव के सुधारों का सुझाव देना चाहते हैं? हम यहाँ मदद के लिए हैं।',
    contactDirectTitle: 'सीधे संपर्क सूत्र',
    contactDirectSubtitle: 'आयोजन समिति से बेझिझक संपर्क करें, सक्रिय कोषाध्यक्षों से संपर्क करें, या पंचायत भवन में हमारे कार्यालय में आएं।',
    contactAddressTitle: 'गाँव का पता',
    contactAddressText: 'पंचायत भवन, महुआ, जिला पश्चिम चंपारण, बिहार — 845106',
    contactEmailTitle: 'ईमेल सहायता',
    contactWhatsAppTitle: 'सक्रिय कोषाध्यक्ष (WhatsApp)',
    contactWhatsAppText: 'भुगतान संबंधी त्वरित शंकाओं के समाधान के लिए सीधे WhatsApp पर कोषाध्यक्ष से जुड़ें।',
    contactWhatsAppBtn: 'WhatsApp पर चैट करें',
    contactDevTag: 'एमएम इंजीनियरिंग कॉलेज बी.टेक सीएसई टीम द्वारा समुदाय के लिए विकसित।',
    contactFormTitle: 'संदेश भेजें',
    contactFormFieldsHelp: '* से चिह्नित फ़ील्ड अनिवार्य हैं।',
    contactFormName: 'पूरा नाम',
    contactFormPhone: 'फ़ोन नंबर',
    contactFormEmail: 'ईमेल पता',
    contactFormEmailOptional: '(वैकल्पिक)',
    contactFormReason: 'पूछताछ का कारण',
    contactFormMsg: 'संदेश',
    contactFormMsgPlaceholder: 'अपना प्रश्न या अभियान सुझाव यहाँ लिखें...',
    contactFormBtn: 'संदेश भेजें',
    contactFaqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    contactFaqSubtitle: 'सुरक्षा, भुगतान, पारदर्शी रसीदें, प्रवासी स्थिति (NRI) और भूमिकाओं के बारे में त्वरित उत्तर।',
    contactSuccessTitle: 'संदेश सफलतापूर्वक भेजा गया!',
    contactSuccessDesc: 'हमसे संपर्क करने के लिए धन्यवाद। आपका संदेश प्राप्त हो गया है, और हमारे पंचायत व्यवस्थापक जल्द ही इस पर ध्यान देंगे।',
    contactSuccessBtn: 'दूसरा संदेश भेजें',
    contactCatGeneral: 'सामान्य पूछताछ',
    contactCatIssue: 'समस्या दर्ज करें',
    contactCatSuggest: 'अभियान सुझाव',
    contactCatTechnical: 'तकनीकी समस्या',

    faq1Q: 'मुझे कैसे पता चलेगा कि मेरा पैसा सही जगह पर पहुँचा?',
    faq1A: 'विलेजफंड पर हर एक लेनदेन सार्वजनिक रूप से दर्ज किया जाता है। जब आप योगदान करते हैं, तो आपका पैसा सीधे संबंधित अभियान खाते में जाता है, और लेनदेन की स्थिति को वास्तविक समय में ट्रैक किया जा सकता है। सभी खर्च कोषाध्यक्ष द्वारा डिजिटल रसीदों के साथ जमा किए जाने चाहिए, जिन्हें आप किसी भी समय \'पारदर्शिता\' टैब या अभियान पृष्ठ के तहत देख सकते हैं।',
    faq2Q: 'यदि मैं गाँव से बाहर (NRI) रहता हूँ तो क्या मैं योगदान कर सकता हूँ?',
    faq2A: 'हाँ, बिल्कुल! गाँव से बाहर रहने वाले प्रवासी (NRIs) और समुदाय के सदस्यों का विकास कार्यों का समर्थन करने के लिए स्वागत है। यदि आप एक NRI योगदानकर्ता हैं, तो आप हमारे कैशफ्री पेमेंट गेटवे के माध्यम से सुरक्षित रूप से ऑनलाइन भुगतान जमा करने के लिए सुपर एडमिन से गेस्ट योगदानकर्ता (GUEST_CONTRIBUTOR) अपग्रेड का अनुरोध कर सकते हैं।',
    faq3Q: 'योगदान की स्वीकृति में कितना समय लगता है?',
    faq3A: 'चूँकि हमने स्वचालित कैशफ्री पेमेंट गेटवे को एकीकृत किया है, इसलिए भुगतान सत्यापन वास्तविक समय में होता है। एक बार लेनदेन पूरा हो जाने के बाद, आपका योगदान स्थिति लगभग तुरंत स्वीकृत (APPROVED) में बदल जाएगी। मैनुअल या लंबित भुगतानों को कुछ ही मिनटों में जांच कर स्वीकृत कर दिया जाता है।',
    faq4Q: 'अभियान कौन बना सकता है?',
    faq4A: 'गाँव की समिति या पंचायत द्वारा विकास कार्य या सांस्कृतिक कार्यक्रम को मंजूरी देने के बाद अभियान केवल नामित कोषाध्यक्षों या सुपर एडमिन द्वारा ही बनाए जा सकते हैं। हालाँकि, कोई भी योगदानकर्ता नए अभियानों का सुझाव देने के लिए हमारे संपर्क फ़ॉर्म का उपयोग कर सकता है!',
    faq5Q: 'यदि कोई अभियान अपने लक्ष्य तक नहीं पहुँचता है तो क्या होगा?',
    faq5A: 'यदि कोई अभियान समय सीमा तक अपने फंडिंग लक्ष्य तक पहुँचने में विफल रहता है, तो ग्राम समिति बैठक करके यह तय करती है कि अवधि बढ़ानी है, परियोजना के छोटे संस्करण के साथ आगे बढ़ना है, या भविष्य के विकास के लिए योगदान को ग्राम आरक्षित कोष (Village Reserve Fund) में वापस करना है।',
    faq6Q: 'मैं कोषाध्यक्ष कैसे बनूँ?',
    faq6A: 'कोषाध्यक्षों को ग्राम पंचायत या आयोजन समिति द्वारा नामित और अनुमोदित किया जाता है। एक बार नामित होने के बाद, सुपर एडमिन आपके खाता भूमिका को अपग्रेड कर देगा, जिससे आपको अभियान शुरू करने, बजट प्रबंधित करने और खर्चों को पोस्ट करने की अनुमति मिल जाएगी।',
    faq7Q: 'क्या मेरा योगदान डेटा सभी को दिखाई देता है?',
    faq7A: 'पूर्ण पारदर्शिता सुनिश्चित करने के लिए, योगदानकर्ता के नाम, राशि और तारीखें सार्वजनिक हैं। हालाँकि, गोपनीयता और सुरक्षा बनाए रखने के लिए संवेदनशील बिलिंग विवरण, पूर्ण फ़ोन नंबर और लेनदेन आईडी सुरक्षित रूप से छिपे रहते हैं।',
    faq8Q: 'मैं किसी संदिग्ध खर्च की रिपोर्ट कैसे करूँ?',
    faq8A: 'यदि आप बिना किसी वैध रसीद फोटो के सूचीबद्ध खर्च देखते हैं या संदिग्ध महसूस करते हैं, तो आप अभियान या पारदर्शिता पृष्ठ से उस विशिष्ट खर्च कार्ड पर \'फ्लैग\' (Flag) आइकन पर क्लिक कर सकते हैं। यह एक अलर्ट जारी करता है जिसकी सुपर एडमिन द्वारा तुरंत जांच की जाती है।',

    // Campaigns Page
    campaignsPageTitle: 'ग्राम अभियान',
    campaignFilterAll: 'सभी',
    campaignFilterActive: 'सक्रिय',
    campaignFilterFunded: 'वित्तपोषित',
    campaignNoneFound: 'कोई अभियान नहीं मिला',
    campaignNoneFoundDesc: 'बाद में पुनः जांचें या एक नया अभियान शुरू करें।',

    // Campaign Detail
    campaignNotFound: 'अभियान नहीं मिला',
    backToCampaigns: 'अभियानों पर वापस',
    budgetBreakdown: 'बजट विवरण',
    campaignUpdates: 'अभियान अपडेट',
    noUpdatesYet: 'अभी तक कोई अपडेट नहीं।',
    ends: 'समाप्ति',
    transparencyInfo: 'पारदर्शिता जानकारी',
    createdBy: 'द्वारा बनाया गया',
    treasurer: 'कोषाध्यक्ष',
    villageCommittee: 'ग्राम समिति',
    pending: 'लंबित',

    // Contribution Form
    makeContribution: 'योगदान करें',
    loginToContribute: 'लॉगिन करें',
    loginToContributePrefix: 'कृपया',
    loginToContributeSuffix: 'योगदान करने के लिए।',
    amountLabel: 'राशि (₹)',
    noteLabel: 'नोट (वैकल्पिक)',
    payNow: 'अभी भुगतान करें',
    redirectingToCheckout: 'चेकआउट पर भेजा जा रहा है...',
    paymentSessionError: 'भुगतान सत्र प्रारंभ नहीं हो सका।',
    paymentInitError: 'भुगतान शुरू करने में विफल। कृपया अपने विवरण जांचें।',
    paymentMethodLabel: 'भुगतान विधि चुनें',
    payOnline: 'ऑनलाइन भुगतान (Cashfree)',
    payManual: 'सीधा UPI ट्रांसफर (मैनुअल UTR सत्यापन)',
    upiInstructions: 'किसी भी UPI ऐप (GPay, PhonePe, Paytm) से ट्रांसफर करने के लिए नीचे दिए गए QR कोड को स्कैन करें या UPI आईडी को कॉपी करें, फिर सबमिट करने के लिए नीचे अपना 12-अंकीय UTR/ट्रांजैक्शन आईडी दर्ज करें।',
    upiIdLabel: 'अभियान UPI आईडी',
    copySuccess: 'क्लिपबोर्ड पर कॉपी किया गया!',
    utrLabel: 'UTR / ट्रांजैक्शन आईडी (12 अंक)',
    submitManualPay: 'मैनुअल योगदान सबमिट करें',
    submittingManualPay: 'अनुरोध सबमिट किया जा रहा है...',
    manualSuccessMsg: 'योगदान अनुरोध सफलतापूर्वक सबमिट किया गया! जैसे ही कोषाध्यक्ष बैंक स्टेटमेंट में लेनदेन का सत्यापन करेंगे, इसे स्वीकृत कर दिया जाएगा।',

    // Leaderboard
    leaderboardTitle: 'ग्राम सम्मान पट्ट',
    leaderboardSubtitle: 'महुआ के विकास को गति देने वाले सामुदायिक नायकों को सम्मान।',
    tabContributors: 'शीर्ष योगदानकर्ता',
    tabStreaks: 'सक्रिय स्ट्रीक',
    colRank: 'क्रमांक',
    colContributor: 'योगदानकर्ता',
    colVillage: 'गाँव/क्षेत्र',
    colTotalAmount: 'कुल राशि',
    colCurrentStreak: 'वर्तमान स्ट्रीक',
    leaderboardEmpty: 'अभी तक कोई डेटा उपलब्ध नहीं है। पहले बनने के लिए योगदान शुरू करें!',
    leaderboardCtaTitle: 'अपना नाम यहाँ देखना चाहते हैं?',
    leaderboardCtaDesc: 'हर योगदान, चाहे बड़ा हो या छोटा, हमें मिलकर एक मजबूत गाँव बनाने में मदद करता है।',
    contributeNow: 'अभी योगदान करें',

    // Transparency Page
    transparencyTitle: 'सार्वजनिक बहीखाता',
    transparencyDesc: 'हम 100% पारदर्शिता में विश्वास करते हैं। ग्राम कोष में दिए गए हर रुपये का यहाँ हिसाब रखा जाता है, और हर बड़े खर्च के लिए ग्राम समिति की बहु-हस्ताक्षर मंजूरी आवश्यक है।',
    totalRaisedLabel: 'कुल एकत्रित',
    totalSpentLabel: 'कुल खर्च',
    villageReserve: 'ग्राम आरक्षित कोष',
    approvedExpensesTitle: 'स्वीकृत खर्च रजिस्टर',
    noExpensesApproved: 'अभी तक कोई खर्च स्वीकृत नहीं हुआ है।',
    colDate: 'तारीख',
    colExpenseDetails: 'खर्च विवरण',
    colAmount: 'राशि',
    forCampaign: 'अभियान',
    multiSigVerified: 'बहु-हस्ताक्षर सत्यापित',

    // Gallery
    galleryTitle: 'ग्राम प्रगति गैलरी',
    gallerySubtitle: 'हमारे समुदाय की नज़रों से महुआ के बदलाव को देखें।',
    galleryFilterAll: 'सभी फ़ोटो',
    galleryFilterBefore: 'पहले',
    galleryFilterDuring: 'दौरान',
    galleryFilterAfter: 'बाद में',
    galleryFilterEvents: 'कार्यक्रम',
    galleryEmpty: 'इस श्रेणी में अभी तक कोई फ़ोटो नहीं मिली। परियोजनाओं के आगे बढ़ने पर प्रगति के प्रमाण यहाँ अपलोड किए जाएंगे!',
    galleryGeneral: 'सामान्य विकास',

    // Profile
    profileNriTag: 'NRI समर्थक 🌐',
    profileContribRank: 'योगदान क्रमांक',
    profileBadgesWon: 'बैज प्राप्त',
    profileTotalInvested: 'कुल निवेश',
    profileProjectsBacked: 'समर्थित परियोजनाएं',
    profileActiveStreak: 'सक्रिय स्ट्रीक',
    profileLongestStreak: 'सबसे लंबी स्ट्रीक',
    profileCampaignUnit: 'अभियान',
    profileTabContributions: 'मेरे योगदान',
    profileTabBadges: 'बैज और उपलब्धियां',
    profileTabPledges: 'प्रतिज्ञा ट्रैकर',
    profileContribLog: 'योगदान लॉग',
    profileDownloadPdf: 'सारांश PDF डाउनलोड करें',
    profileNoContrib: 'इस खाते पर कोई योगदान नहीं मिला।',
    profileColDate: 'जमा तिथि',
    profileColCampaignId: 'अभियान आईडी',
    profileColAmount: 'राशि',
    profileColUtr: 'लेनदेन संदर्भ (UTR)',
    profileColStatus: 'स्थिति',
    profileLoadingItems: 'प्रोफाइल आइटम लोड हो रहे हैं...',
    profileBadgesTitle: 'गेमिफिकेशन शोकेस',
    profileBadgesDesc: 'ग्राम पहलों का समर्थन करके और लगातार योगदान स्ट्रीक पूरी करके बैज अनलॉक करें।',
    profileNoBadges: 'बैकएंड पर कोई बैज कॉन्फ़िगरेशन नहीं मिला।',
    profileBadgeEarned: 'अर्जित',
    profilePledgesTitle: 'मासिक योगदान प्रतिज्ञा',
    profilePledgesDesc: 'मासिक किस्त प्रतिज्ञा स्थापित करके ग्राम बुनियादी ढांचे और कल्याण परियोजनाओं का समर्थन करने की प्रतिबद्धता जताएं। उन NRIs के लिए उपयुक्त जो अपनी मातृभूमि का लगातार समर्थन करना चाहते हैं।',
    profileActivePledge: 'सक्रिय प्रतिज्ञा',
    profileActive: 'सक्रिय',
    profileCampaignTarget: 'अभियान लक्ष्य',
    profileInstallment: 'किस्त',
    profileNextDueDate: 'अगली देय तिथि',
    profilePayInstallment: 'किस्त भुगतान करें',
    profileCancelPledge: 'प्रतिज्ञा रद्द करें',

    // Dashboard
    dashboardTitle: 'मेरा डैशबोर्ड',
    dashboardWelcome: 'वापसी पर स्वागत है,',
    dashboardAdminPanel: 'एडमिन पैनल पर जाएं',
    dashboardTotalContributed: 'कुल योगदान',
    dashboardActiveStreak: 'सक्रिय स्ट्रीक',
    dashboardMonths: 'महीने',
    dashboardBadgesEarned: 'अर्जित बैज',
    dashboardContribHistory: 'मेरा योगदान इतिहास',
    dashboardNoContrib: 'आपने अभी तक कोई योगदान नहीं किया है।',
    dashboardExploreCampaigns: 'अभियान देखें',
    dashboardColDate: 'तारीख',
    dashboardColCampaignId: 'अभियान आईडी',
    dashboardColAmount: 'राशि',
    dashboardColUtr: 'लेनदेन आईडी / UTR',
    dashboardColStatus: 'स्थिति',

    // Notifications
    notifTitle: 'सूचना केंद्र',
    notifNew: 'नई',
    notifSubtitle: 'महुआ में अभियानों, उपलब्धियों और खर्च स्वीकृतियों के बारे में अपडेट रहें।',
    notifMarkAllRead: 'सभी पढ़ा हुआ चिह्नित करें',
    notifLoading: 'आपकी सूचनाएं लोड हो रही हैं...',
    notifNone: 'अभी तक कोई सूचना नहीं',
    notifNoneDesc: 'जब नए अभियान शुरू होंगे या आपके भुगतान स्वीकृत होंगे तो हम आपको सूचित करेंगे!',
    notifViewCampaign: 'अभियान देखें',
    notifMarkRead: 'पढ़ा हुआ चिह्नित करें',

    // Login
    loginTitle: 'वापसी पर स्वागत है',
    loginPhone: 'फ़ोन नंबर',
    loginPassword: 'पासवर्ड',
    loginBtn: 'लॉगिन',
    loginOr: 'या',
    loginNoAccount: 'खाता नहीं है?',
    loginRegisterLink: 'यहाँ पंजीकरण करें',
    loginInvalidCreds: 'अमान्य क्रेडेंशियल',
    loginGoogleFailed: 'Google लॉगिन विफल',

    // Register
    registerTitle: 'विलेजफंड से जुड़ें',
    registerName: 'पूरा नाम',
    registerEmail: 'ईमेल पता (वैकल्पिक)',
    registerPhone: 'फ़ोन नंबर',
    registerPassword: 'पासवर्ड',
    registerConfirmPassword: 'पासवर्ड की पुष्टि करें',
    registerBtn: 'पंजीकरण',
    registerHaveAccount: 'पहले से खाता है?',
    registerLoginLink: 'यहाँ लॉगिन करें',
    registerPasswordMismatch: 'पासवर्ड मेल नहीं खाते',
    registerFailed: 'पंजीकरण विफल। कृपया अपने विवरण जांचें।',

    // Thank You
    thankYouTitle: 'धन्यवाद!',
    thankYouDesc: 'आपका योगदान सफलतापूर्वक जमा हो गया है। यह वर्तमान में',
    thankYouPending: 'लंबित (PENDING)',
    thankYouDescSuffix: 'समीक्षा में है। एक बार जब ग्राम कोषाध्यक्ष UTR/लेनदेन आईडी को बैंक विवरण से सत्यापित कर लेगा, तो इसे स्वीकृत (APPROVED) के रूप में चिह्नित किया जाएगा और अभियान की कुल राशि में जोड़ा जाएगा।',
    thankYouDashboard: 'मेरे डैशबोर्ड पर जाएं',
    thankYouExplore: 'अधिक अभियान देखें',

    // Payment Status
    paymentVerifying: 'भुगतान सत्यापित हो रहा है',
    paymentVerifyingDesc: 'कृपया प्रतीक्षा करें, बैंक से पुष्टि प्राप्त हो रही है...',
    paymentAttempt: 'प्रयास',
    paymentAttemptOf: 'में से',
    paymentSuccess: 'भुगतान सफल!',
    paymentSuccessDesc: 'आपके उदार सहयोग के लिए धन्यवाद! आपका',
    paymentSuccessDescSuffix: 'का योगदान प्राप्त हो गया है और अभियान में जमा कर दिया गया है।',
    paymentOrderId: 'ऑर्डर आईडी',
    paymentPending: 'सत्यापन लंबित',
    paymentPendingDesc: 'आपके भुगतान लेनदेन को बैंक से स्वीकृति मिलने में थोड़ा अधिक समय लग रहा है। चिंता न करें, आपका डैशबोर्ड कुछ ही मिनटों में स्वचालित रूप से अपडेट हो जाएगा।',
    paymentFailed: 'भुगतान विफल',
    paymentFailedDesc: 'भुगतान अनुरोध असफल या रद्द हो गया। आपके खाते से कोई राशि नहीं काटी गई है। कृपया पुनः प्रयास करें या किसी समस्या के लिए संपर्क करें।',
    paymentAllCampaigns: 'सभी अभियान',
    paymentMyDashboard: 'मेरा डैशबोर्ड',
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
