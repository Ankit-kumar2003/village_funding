import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  ShieldCheck,
  IndianRupee,
  TrendingUp,
  Heart,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Receipt,
  Vote,
  Eye,
} from 'lucide-react';

// Inline brand SVGs (lucide-react doesn't ship brand icons)
const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import api from '../api/axios';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function About() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('stats/');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch platform stats', err);
      }
    };
    fetchStats();
  }, []);

  const howItWorks = [
    {
      step: '01',
      icon: <Vote className="w-7 h-7" />,
      title: 'Campaign Proposed',
      description:
        'The village committee or Treasurer proposes a new project — temple renovation, road repair, or cultural celebration — with a clear goal and itemized budget.',
      color: 'bg-primary/10 text-primary',
      border: 'border-primary/20',
    },
    {
      step: '02',
      icon: <Banknote className="w-7 h-7" />,
      title: 'Community Funds It',
      description:
        'Contributors pay securely through Cashfree — no handing cash to individuals. Every payment is auto-verified and instantly recorded on the public ledger.',
      color: 'bg-secondary/10 text-secondary',
      border: 'border-secondary/20',
    },
    {
      step: '03',
      icon: <Receipt className="w-7 h-7" />,
      title: 'Every Expense Receipted',
      description:
        'The Treasurer posts every expense with a digital receipt photo. Expenses above ₹2,000 require multi-signature approval from committee members.',
      color: 'bg-blue-500/10 text-blue-500',
      border: 'border-blue-500/20',
    },
    {
      step: '04',
      icon: <Eye className="w-7 h-7" />,
      title: 'Public Accountability',
      description:
        'Anyone in the village — or the world — can view the full ledger, expense receipts, audit log, and financial health score. Zero hidden transactions.',
      color: 'bg-purple-500/10 text-purple-500',
      border: 'border-purple-500/20',
    },
  ];

  const teamMembers = [
    {
      name: 'Ankit Kumar',
      role: 'Platform Creator & Developer',
      description: 'B.Tech CSE 2026, MM Engineering College, Mullana, Haryana',
      initial: 'AK',
      gradient: 'from-primary to-orange-600',
    },
    {
      name: 'Village Treasurer',
      role: 'Active Treasurer',
      description: 'Manages all campaigns, verifies contributions, and posts expenses with receipts.',
      initial: 'VT',
      gradient: 'from-secondary to-green-600',
    },
    {
      name: 'Panchayat Committee',
      role: 'Super Admin & Oversight',
      description: 'Approves multi-signature expenses, manages roles, and maintains the audit log.',
      initial: 'PC',
      gradient: 'from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="w-full">
      {/* ───────────── Section 1: Village Hero ───────────── */}
      <section className="relative bg-gradient-to-br from-primary/90 via-orange-700 to-orange-900 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-2xl" />

        <div className="container mx-auto px-4 py-28 md:py-36 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Mahuaa · West Champaran · Bihar · PIN 845106</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight"
            >
              About <span className="text-green-300">VillageFund</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-orange-100 leading-relaxed max-w-3xl mx-auto"
            >
              Mahuaa is a vibrant, tight-knit village community in West Champaran, Bihar, that regularly comes together
              to improve school facilities, install street lights, and build infrastructure.
              VillageFund was born to make sure every single rupee contributed is
              publicly accounted for — rebuilding the trust that manual collection eroded.
            </motion.p>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[50px] md:h-[100px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.34,201.34,109.1,241.6,103.48,281.33,88.75,321.39,56.44Z"
              className="fill-background transition-colors duration-300"
            />
          </svg>
        </div>
      </section>

      {/* ───────────── Section 1.5: Village Geography & Satellite Tracker ───────────── */}
      <section className="py-20 bg-surface border-b border-gray-200/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Coordinates Detail Card */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-wider">
                📍 Village Basecamp
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1C1C1C] leading-tight">
                Our Geographic Coordinates in <span className="text-primary">Mahuaa</span>
              </h2>
              <p className="text-gray-600 leading-relaxed font-semibold text-sm">
                Mahuaa is nestled in the West Champaran district of Bihar. In order to drive complete geographic transparency, our fundraising platform maps development campaigns directly to the physical locations where they are implemented.
              </p>
              <div className="p-5 bg-background border border-gray-200 rounded-3xl flex items-center gap-4 shadow-sm">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl font-black font-mono text-center text-xs tracking-wider border border-primary/20">
                  27°11'21.6"N
                  <br />
                  84°11'01.7"E
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Registered Basecamp</p>
                  <p className="font-extrabold text-gray-800 text-sm mt-0.5">Mahuaa, PIN 845106</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">West Champaran, Bihar, India</p>
                </div>
              </div>
            </div>

            {/* Embedded Live Map Card */}
            <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden h-[420px]">
              <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center -z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
              <iframe
                title="Mahuaa Village Basecamp Satellite View"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, borderRadius: '1.25rem' }}
                src="https://maps.google.com/maps?q=27.189333,84.183806&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────── Section 2: The Problem We Solved ───────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {/* Left — Story */}
            <div className="space-y-6">
              <motion.span variants={fadeUp} className="inline-block text-sm font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
                The Problem
              </motion.span>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-3xl md:text-4xl font-bold font-heading text-text leading-snug"
              >
                Money went into one person's account —{' '}
                <span className="text-primary">no records, no trust.</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-text-muted text-lg leading-relaxed"
              >
                For years, village youth collected contributions for pujas, cultural
                events, and infrastructure work into a single person's personal bank
                account. There were no receipts, no public ledger, and zero
                accountability. People had no idea how much was collected, what was
                spent, or where the rest went. Trust declined. Contributions dried up.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-text-muted text-lg leading-relaxed"
              >
                VillageFund was created to permanently fix this — by making every
                rupee traceable, every expense provable, and every decision transparent
                to the entire community.
              </motion.p>
            </div>

            {/* Right — Before / After Cards */}
            <motion.div variants={fadeUp} custom={2} className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Before VillageFund</h3>
                </div>
                <ul className="space-y-2 text-red-700/80 dark:text-red-300/80">
                  {[
                    'Money collected into personal bank accounts',
                    'No receipts, no records, no public ledger',
                    'People stopped contributing due to mistrust',
                    'Zero accountability on how funds were spent',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-bold text-green-700 dark:text-green-400">After VillageFund</h3>
                </div>
                <ul className="space-y-2 text-green-700/80 dark:text-green-300/80">
                  {[
                    'Payments via secure Cashfree gateway — auto-verified',
                    'Every contribution & expense logged on a public ledger',
                    'Multi-signature approval for large expenses',
                    'Community can flag suspicious transactions',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="mt-0.5 w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── Section 3: How It Works (4-step) ───────────── */}
      <section className="py-20 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="inline-block text-sm font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-heading text-text mb-4">
              From Proposal to Public Record
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted text-lg">
              A simple, transparent four-step process that ensures trust at every stage.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className={`relative bg-background rounded-2xl p-6 border ${step.border} shadow-sm hover:shadow-lg transition-all duration-300 group`}
              >
                {/* Step number */}
                <span className="absolute -top-3 -right-3 w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-xs font-extrabold text-text-muted shadow-sm">
                  {step.step}
                </span>

                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold font-heading text-text mb-3">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── Section 4: Village Committee / Team ───────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="inline-block text-sm font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              The Team
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-heading text-text mb-4">
              Village Committee & Builder
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted text-lg">
              Meet the people making transparent governance a reality in Sundarpur.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-surface rounded-2xl border border-border p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-extrabold font-heading shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {member.initial}
                </div>
                <h3 className="text-xl font-bold font-heading text-text">{member.name}</h3>
                <p className="text-primary font-semibold text-sm mt-1">{member.role}</p>
                <p className="text-text-muted text-sm mt-3 leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── Section 5: Live Platform Stats ───────────── */}
      <section className="py-20 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="inline-block text-sm font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              Live Numbers
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-heading text-text">
              Platform Impact So Far
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {[
              {
                icon: <IndianRupee className="w-7 h-7" />,
                value: stats ? `₹${Number(stats.total_raised || 0).toLocaleString('en-IN')}` : '—',
                label: 'Total Raised',
                color: 'text-primary bg-primary/10',
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                value: stats ? (stats.campaigns_completed ?? '—') : '—',
                label: 'Campaigns Completed',
                color: 'text-secondary bg-secondary/10',
              },
              {
                icon: <Users className="w-7 h-7" />,
                value: stats ? (stats.active_contributors ?? '—') : '—',
                label: 'Active Contributors',
                color: 'text-blue-500 bg-blue-500/10',
              },
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                value: stats ? (stats.health_score ? `${stats.health_score}/100` : '100/100') : '—',
                label: 'Trust Score',
                color: 'text-purple-500 bg-purple-500/10',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-background rounded-2xl border border-border p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-text">{stat.value}</h3>
                <p className="text-text-muted text-sm font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── Section 6: Tech Credits ───────────── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto bg-surface rounded-3xl border border-border shadow-xl p-10 md:p-14 text-center relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />

            <motion.div variants={fadeUp} className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <Heart className="w-8 h-8" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-heading text-text mb-3">
                Built with ❤️ for Sundarpur
              </h2>
              <p className="text-text-muted text-lg leading-relaxed mb-2">
                This platform was designed and developed by
              </p>
              <h3 className="text-xl font-bold font-heading text-primary">Ankit Kumar</h3>
              <p className="text-text-muted mt-1">
                B.Tech CSE 2026 · MM Engineering College, Mullana, Haryana
              </p>

              <div className="flex justify-center items-center space-x-4 mt-8">
                <a
                  href="https://github.com/Ankit-kumar2003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-text text-surface rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/ankit-kumar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>

              <p className="text-text-muted text-xs mt-8">
                Built with Django · React · Tailwind CSS · Cashfree · Cloudinary · Vercel · Railway
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── CTA Section ───────────── */}
      <section className="py-20 bg-gradient-to-br from-secondary to-green-800 text-white text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-heading">
              Ready to support your village?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-xl text-green-100 max-w-2xl mx-auto">
              Join Sundarpur's transparent community fundraising platform — every contribution matters, and every rupee is tracked.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-5 pt-4">
              <Link
                to="/campaigns"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-secondary font-extrabold rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              >
                <span>Explore Campaigns</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/transparency"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold rounded-full transition-colors"
              >
                View Transparency
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
