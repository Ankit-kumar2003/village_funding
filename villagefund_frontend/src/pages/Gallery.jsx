import { useEffect, useState } from 'react';
import { getGallery } from '../api/gallery';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { label: 'All Photos', value: 'ALL' },
    { label: 'Before', value: 'BEFORE' },
    { label: 'During', value: 'DURING' },
    { label: 'After', value: 'AFTER' },
    { label: 'Events', value: 'EVENT' }
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await getGallery();
        setPhotos(res.data.results || res.data);
      } catch (error) {
        console.error("Failed to fetch gallery", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredPhotos = activeCategory === 'ALL' 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  const getDemoImage = (item) => {
    if (!item.photo.includes('dummy')) return item.photo;
    
    const keywords = {
      'well': 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&q=80&w=800',
      'classroom': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      'health': 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800',
      'light': 'https://images.unsplash.com/photo-1542350327-01217ec614d1?auto=format&fit=crop&q=80&w=800',
      'road': 'https://images.unsplash.com/photo-1541625602330-2277a4c4b282?auto=format&fit=crop&q=80&w=800',
      'water': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800'
    };

    const caption = item.caption.toLowerCase();
    for (const [key, url] of Object.entries(keywords)) {
      if (caption.includes(key)) return url;
    }
    
    return `https://picsum.photos/seed/${item.id}/800/800`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-heading text-text mb-4 dark:text-white">Village Progress Gallery</h1>
        <p className="text-text-muted text-lg">Witness the transformation of Sundarpur through the eyes of our community.</p>
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeCategory === cat.value
                ? 'bg-secondary text-white shadow-md'
                : 'bg-surface text-text-muted hover:bg-border border border-border dark:bg-surface dark:text-text-muted'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <p className="text-text-muted text-xl">No photos found in this category yet. Proof of progress will be uploaded here as projects move forward!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((item) => (
            <div key={item.id} className="group bg-surface rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative aspect-square overflow-hidden bg-background">
                <img 
                  src={getDemoImage(item)} 
                  alt={item.caption} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Village+Project';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm ${
                    item.category === 'AFTER' ? 'bg-green-500 text-white' :
                    item.category === 'BEFORE' ? 'bg-orange-500 text-white' :
                    'bg-primary text-white'
                  }`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-text mb-1 line-clamp-1">{item.caption}</p>
                <p className="text-xs text-text-muted">{item.campaign_title || 'General Development'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
