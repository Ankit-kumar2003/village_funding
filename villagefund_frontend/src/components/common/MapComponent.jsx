import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';

// Custom pulsating SVG Icon generator for React-Leaflet markers to avoid Vite path errors and match premium aesthetic
const createGlowingIcon = (color) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style="background-color: ${color};"></span>
        <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${color};"></div>
      </div>
    `,
    className: 'custom-leaflet-icon-wrapper',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  });
};

export default function MapComponent() {
  const { t } = useLanguage();
  const mahuaaCenter = [27.189333, 84.183806]; // Mahuaa, West Champaran, Bihar coordinates

  // Visual markers centered around basecamp coordinates representing actual campaigns
  const projects = [
    {
      id: 'basecamp',
      title: t('mapBasecampTitle') || 'Panchayat Bhavan (Basecamp)',
      desc: t('mapBasecampDesc') || 'Central coordination hub and oversight office.',
      coordinates: [27.189333, 84.183806],
      color: '#FF6B00', // Orange
      status: 'ACTIVE_CENTER',
      raised: 'N/A',
      goal: 'N/A'
    },
    {
      id: 'school',
      title: 'Mahuaa Smart School Infrastructure',
      desc: 'Modern digital classrooms, library expansions, and sanitary units for 400+ children.',
      coordinates: [27.1898, 84.1845],
      color: '#1A6B3C', // Green
      status: 'FUNDING_ACTIVE',
      raised: '₹85,000',
      goal: '₹1,20,000',
      progress: 70
    },
    {
      id: 'solar',
      title: 'Solar Street Lights Grid',
      desc: 'Installation of high-efficiency LED street lights across dark village main intersections.',
      coordinates: [27.1888, 84.1830],
      color: '#D4AF37', // Amber/Yellow
      status: 'COMPLETED',
      raised: '₹45,000',
      goal: '₹45,000',
      progress: 100
    },
    {
      id: 'water',
      title: 'Solar Drinking Water Pump',
      desc: 'Deep boring solar filtration grid providing clean water access to southern households.',
      coordinates: [27.1880, 84.1852],
      color: '#0284C7', // Blue
      status: 'FUNDING_ACTIVE',
      raised: '₹12,000',
      goal: '₹80,000',
      progress: 15
    }
  ];

  return (
    <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl relative z-10">
      <MapContainer 
        center={mahuaaCenter} 
        zoom={17} 
        scrollWheelZoom={false} 
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((project) => (
          <Marker 
            key={project.id} 
            position={project.coordinates} 
            icon={createGlowingIcon(project.color)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3 text-[#1C1C1C] min-w-[200px] font-sans">
                <span 
                  className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white mb-2"
                  style={{ backgroundColor: project.color }}
                >
                  {project.status.replace('_', ' ')}
                </span>
                <h4 className="font-extrabold text-sm leading-tight text-gray-900 mb-1">{project.title}</h4>
                <p className="text-xs text-gray-500 leading-normal mb-3 font-medium">{project.desc}</p>
                
                {project.progress !== undefined && (
                  <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
                    <div className="flex justify-between text-[10px] font-black text-gray-700">
                      <span>{project.raised} {t('raisedOf') || 'raised of'} {project.goal}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
