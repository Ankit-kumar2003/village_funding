import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Award, Lock } from 'lucide-react';

export default function ThreeDBadgeCard({ badge, earned, t }) {
  const [isHovered, setIsHovered] = useState(false);

  // Motion Values for mouse location tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Rotations mapped based on mouse offsets (creates 3D tilt effect)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  // Holographic reflection highlight position mapped to cursor
  const shimmerX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const shimmerY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    // Set normalized mouse positions (-0.5 to 0.5)
    mouseX.set(x / width);
    mouseY.set(y / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Determine medal ranks and glowing shadows
  const getMedalStyles = () => {
    if (!earned) return 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 grayscale opacity-60';
    
    const name = badge.name.toLowerCase();
    if (name.includes('gold') || name.includes('crore') || name.includes('lakh') || name.includes('patron')) {
      return 'border-[#D4AF37] bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 shadow-yellow-500/10 dark:shadow-yellow-500/5 hover:border-yellow-400';
    }
    if (name.includes('silver') || name.includes('star') || name.includes('streak')) {
      return 'border-slate-300 bg-gradient-to-br from-white via-slate-50/20 to-zinc-50/10 shadow-slate-400/10 dark:shadow-slate-400/5 hover:border-slate-400';
    }
    return 'border-amber-600 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/10 shadow-amber-700/10 dark:shadow-amber-700/5 hover:border-amber-500';
  };

  const getAwardBg = () => {
    if (!earned) return 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600';
    
    const name = badge.name.toLowerCase();
    if (name.includes('gold') || name.includes('crore') || name.includes('lakh') || name.includes('patron')) {
      return 'bg-yellow-100 text-[#D4AF37] dark:bg-yellow-950/30';
    }
    if (name.includes('silver') || name.includes('star') || name.includes('streak')) {
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
    }
    return 'bg-amber-100 text-amber-600 dark:bg-amber-950/30';
  };

  return (
    <motion.div
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      className="w-full"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.04 : 1,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex items-start gap-4 cursor-pointer select-none ${getMedalStyles()}`}
      >
        {/* Holographic light reflection sheen overlay */}
        {earned && isHovered && (
          <motion.div 
            style={{
              background: `radial-gradient(circle at ${shimmerX} ${shimmerY}, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`
            }}
            className="absolute inset-0 pointer-events-none mix-blend-overlay z-20"
          />
        )}

        <div className={`p-4 rounded-2xl flex-shrink-0 transition-colors z-10 ${getAwardBg()}`}>
          <Award className="w-8 h-8" />
        </div>
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold font-heading text-gray-800 dark:text-slate-100">{badge.name}</h4>
            {earned && (
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                {t('profileBadgeEarned') || 'EARNED'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">{badge.description}</p>
          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider pt-1">
            {badge.criteria_type.replace('_', ' ')}: {badge.criteria_value}
          </p>
        </div>

        {!earned && (
          <div className="absolute top-4 right-4 text-gray-300 dark:text-slate-700 z-10">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
