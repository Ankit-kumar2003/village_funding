import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    category: 'GENERAL',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [ticketNumber, setTicketNumber] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { value: 'GENERAL', label: t('contactCatGeneral') },
    { value: 'ISSUE', label: t('contactCatIssue') },
    { value: 'SUGGEST_CAMPAIGN', label: t('contactCatSuggest') },
    { value: 'TECHNICAL', label: t('contactCatTechnical') }
  ];

  const faqs = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      question: t('faq1Q'),
      answer: t('faq1A')
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      question: t('faq2Q'),
      answer: t('faq2A')
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      question: t('faq3Q'),
      answer: t('faq3A')
    },
    {
      icon: <UserCheck className="w-5 h-5 text-purple-500" />,
      question: t('faq4Q'),
      answer: t('faq4A')
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      question: t('faq5Q'),
      answer: t('faq5A')
    },
    {
      icon: <UserCheck className="w-5 h-5 text-orange-500" />,
      question: t('faq6Q'),
      answer: t('faq6A')
    },
    {
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      question: t('faq7Q'),
      answer: t('faq7A')
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      question: t('faq8Q'),
      answer: t('faq8A')
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone_number || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('contact/', formData);
      setTicketNumber(res.data.ticket_number || '');
      setSuccess(true);
      setFormData({
        name: '',
        phone_number: '',
        email: '',
        category: 'GENERAL',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary font-heading font-semibold tracking-wider uppercase text-sm px-3 py-1 bg-orange-50 dark:bg-orange-950/40 rounded-full text-[#FF6B00]">
              {t('contactGetInTouch')}
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold font-heading text-[#1C1C1C] dark:text-white tracking-tight">
              {t('contactTitle')}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              {t('contactSubtitle')}
            </p>
          </motion.div>
        </div>

        {/* Two Column Section: Contact Details & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full"
            >
              <div>
                <h2 className="text-2xl font-bold font-heading text-[#1C1C1C] dark:text-white mb-6">
                  {t('contactDirectTitle')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {t('contactDirectSubtitle')}
                </p>

                <div className="space-y-6">
                  {/* Address Card */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] rounded-2xl flex items-center justify-center shadow-inner">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('contactAddressTitle')}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('contactAddressText')}
                      </p>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] rounded-2xl flex items-center justify-center shadow-inner">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('contactEmailTitle')}</h3>
                      <a href="mailto:rise2gatheradmin@gmail.com" className="text-primary hover:underline font-medium text-[#FF6B00] mt-1 inline-block">
                        rise2gatheradmin@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Treasurer WhatsApp Link */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shadow-inner">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('contactWhatsAppTitle')}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        {t('contactWhatsAppText')}
                      </p>
                      <a 
                        href="https://wa.me/919999999999?text=Hello%20Treasurer,%20I%20have%20a%20query%20regarding%20my%20VillageFund%20contribution." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-[#1A6B3C] text-white rounded-xl text-sm font-bold shadow-md shadow-green-900/10 hover:bg-opacity-95 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('contactWhatsAppBtn')}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Designer / MM Engineering College Tag */}
              <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                {t('contactDevTag')}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Submission Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden h-full flex flex-col justify-center"
            >
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-[#1C1C1C] dark:text-white mb-2">
                      {t('contactSuccessTitle')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      {t('contactSuccessDesc')}
                    </p>

                    {/* Ticket Number Box */}
                    {ticketNumber && (
                      <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-[#FF6B00] rounded-2xl px-8 py-5 mx-auto max-w-xs mb-6">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">Your Ticket Number</p>
                        <p className="text-2xl font-black text-[#FF6B00] tracking-wider">{ticketNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formData.email
                            ? `Confirmation sent to your email`
                            : `Save this number for follow-up`}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mb-6">We typically respond within 24–48 hours.</p>

                    <button
                      onClick={() => { setSuccess(false); setTicketNumber(''); }}
                      className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-opacity-95 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md shadow-orange-500/20"
                    >
                      {t('contactSuccessBtn')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <h2 className="text-2xl font-bold font-heading text-[#1C1C1C] dark:text-white">
                        {t('contactFormTitle')}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('contactFormFieldsHelp')}
                      </p>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 flex items-center space-x-2">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('contactFormName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition duration-200"
                          placeholder="Ankit Kumar"
                          required
                        />
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('contactFormPhone')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition duration-200"
                          placeholder="9999999999"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('contactFormEmail')} <span className="text-gray-400">{t('contactFormEmailOptional')}</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition duration-200"
                          placeholder="ankit@example.com"
                        />
                      </div>

                      {/* Category Dropdown */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('contactFormReason')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition duration-200 appearance-none cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('contactFormMsg')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition duration-200 resize-none"
                        placeholder={t('contactFormMsgPlaceholder')}
                        required
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-[#FF6B00] hover:bg-opacity-95 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{t('contactFormBtn')}</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </motion.div>
          </div>

        </div>

        {/* Bottom Section: Interactive FAQ Accordion */}
        <div className="mt-28">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-[#1C1C1C] dark:text-white flex items-center justify-center space-x-3">
              <HelpCircle className="w-8 h-8 text-[#FF6B00]" />
              <span>{t('contactFaqTitle')}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              {t('contactFaqSubtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-inner">
                        {faq.icon}
                      </div>
                      <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition duration-150">
                        {faq.question}
                      </span>
                    </div>
                    <div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-2 pl-20 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-700/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
