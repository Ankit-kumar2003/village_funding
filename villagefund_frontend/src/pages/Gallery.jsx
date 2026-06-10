import { useEffect, useState } from 'react';
import { getGallery } from '../api/gallery';
import { cloudinaryTransform } from '../utils/cloudinary';
import { useLanguage } from '../context/LanguageContext';
import { X, ZoomIn, Star } from 'lucide-react';

/* ─── Lightbox component ─────────────────────────────────────────────────── */
function Lightbox({ item, onClose }) {
  // Close on backdrop click or Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-surface rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Full image — object-contain so nothing is cropped */}
        <div className="w-full max-h-[70vh] bg-black flex items-center justify-center">
          <img
            src={item.photo}
            alt={item.caption}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Caption bar */}
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-text text-base leading-snug">{item.caption}</p>
            {item.campaign_title && (
              <p className="text-xs text-text-muted mt-1">{item.campaign_title}</p>
            )}
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
            item.category === 'AFTER'  ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
            item.category === 'BEFORE' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
            'bg-primary/20 text-primary'
          }`}>
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Card ───────────────────────────────────────────────────────── */
function GalleryCard({ item, onOpen }) {
  // Thumbnail: Cloudinary auto-smart-crop to 600×600, quality & format auto
  const thumbSrc = cloudinaryTransform(item.photo, 'c_fill,g_auto,w_600,h_600,q_auto,f_auto');

  const CATEGORY_STYLE = {
    AFTER:  'bg-green-500 text-white',
    BEFORE: 'bg-orange-500 text-white',
    DURING: 'bg-blue-500 text-white',
    EVENT:  'bg-purple-500 text-white',
    GENERAL:'bg-primary text-white',
  };

  return (
    <div
      className="group bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onOpen(item)}
    >
      {/* Fixed-ratio image container — always fills card perfectly */}
      <div className="relative w-full aspect-square overflow-hidden bg-background/60">
        <img
          src={thumbSrc}
          alt={item.caption}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // Fallback: try original URL, then placeholder
            if (e.target.src !== item.photo) {
              e.target.src = item.photo;
            } else {
              e.target.src = `https://picsum.photos/seed/${item.id}/600/600`;
            }
          }}
        />

        {/* Subtle zoom hint overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${CATEGORY_STYLE[item.category] || 'bg-primary text-white'}`}>
            {item.category}
          </span>
        </div>

        {/* Featured star */}
        {item.is_featured && (
          <div className="absolute top-3 right-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="p-4">
        <p className="text-sm font-bold text-text line-clamp-1">{item.caption}</p>
        {item.campaign_title && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.campaign_title}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Gallery Page ──────────────────────────────────────────────────── */
export default function Gallery() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [lightboxItem, setLightboxItem] = useState(null);

  const categories = [
    { label: t('galleryFilterAll'),    value: 'ALL' },
    { label: t('galleryFilterBefore'), value: 'BEFORE' },
    { label: t('galleryFilterDuring'), value: 'DURING' },
    { label: t('galleryFilterAfter'),  value: 'AFTER' },
    { label: t('galleryFilterEvents'), value: 'EVENT' },
  ];

  useEffect(() => {
    getGallery()
      .then((res) => setPhotos(res.data.results || res.data))
      .catch((err) => console.error('Failed to fetch gallery', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPhotos =
    activeCategory === 'ALL'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold font-heading text-text mb-4 dark:text-white">
            {t('galleryTitle')}
          </h1>
          <p className="text-text-muted text-lg">{t('gallerySubtitle')}</p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                activeCategory === cat.value
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-surface text-text-muted hover:bg-border border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <p className="text-text-muted text-xl">{t('galleryEmpty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filteredPhotos.map((item) => (
                <GalleryCard key={item.id} item={item} onOpen={setLightboxItem} />
              ))}
            </div>
            <p className="text-center text-xs text-text-muted mt-8 font-medium">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} · Click any image to view full size
            </p>
          </>
        )}
      </div>
    </>
  );
}
