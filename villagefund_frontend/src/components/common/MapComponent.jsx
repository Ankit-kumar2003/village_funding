import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';
import { Orbit, Compass, MapPin } from 'lucide-react';

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
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'zooming' | 'map'
  const [showFlash, setShowFlash] = useState(false);

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

  // 3D Rotating Globe Canvas Loop
  useEffect(() => {
    if (viewMode !== 'globe' && viewMode !== 'zooming') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let rotationAngle = 0;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth * 2;
      canvas.height = parent.clientHeight * 2;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Spherical coordinates representation
    const radius = 180;
    const focalLength = 320;
    const tilt = 0.35; // Tilt angle on X-axis (axial tilt)

    // Generate latitude/longitude grid line points once
    const spherePoints = [];
    // 10 Latitude rings
    for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += Math.PI / 8) {
      const latRadius = radius * Math.cos(lat);
      const y = radius * Math.sin(lat);
      // Longitude points on each latitude ring
      for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 12) {
        const x = latRadius * Math.sin(lon);
        const z = latRadius * Math.cos(lon);
        spherePoints.push({ x, y, z });
      }
    }

    // India/Bihar basecamp beacon coordinate offsets on the sphere
    // India is roughly 22°N, 78°E
    const beaconLat = 22 * (Math.PI / 180);
    const beaconLon = 78 * (Math.PI / 180);
    const beaconPoint = {
      x: radius * Math.cos(beaconLat) * Math.sin(beaconLon),
      y: radius * Math.sin(beaconLat),
      z: radius * Math.cos(beaconLat) * Math.cos(beaconLon)
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Glow backing
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5);
      glowGrad.addColorStop(0, 'rgba(255, 107, 0, 0.03)');
      glowGrad.addColorStop(1, 'rgba(255, 107, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Slow constant rotation speed
      rotationAngle += 0.007;

      // Draw all grid dots
      spherePoints.forEach((pt) => {
        // Rotate around Y-axis (spinning)
        let x1 = pt.x * Math.cos(rotationAngle) - pt.z * Math.sin(rotationAngle);
        let z1 = pt.x * Math.sin(rotationAngle) + pt.z * Math.cos(rotationAngle);

        // Rotate around X-axis (axial tilt)
        let y2 = pt.y * Math.cos(tilt) - z1 * Math.sin(tilt);
        let z2 = pt.y * Math.sin(tilt) + z1 * Math.cos(tilt);

        // 3D Projection coordinates
        const scale = focalLength / (focalLength + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;

        // Visual depth layering: front dots are brighter/larger, back dots are smaller/transparent
        const isFront = z2 <= 0;
        ctx.beginPath();
        ctx.arc(projX, projY, isFront ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fillStyle = isFront 
          ? 'rgba(255, 107, 0, 0.45)' 
          : 'rgba(255, 107, 0, 0.12)';
        ctx.fill();
      });

      // Rotate beacon coordinates
      let bx1 = beaconPoint.x * Math.cos(rotationAngle) - beaconPoint.z * Math.sin(rotationAngle);
      let bz1 = beaconPoint.x * Math.sin(rotationAngle) + beaconPoint.z * Math.cos(rotationAngle);
      let by2 = beaconPoint.y * Math.cos(tilt) - bz1 * Math.sin(tilt);
      let bz2 = beaconPoint.y * Math.sin(tilt) + bz1 * Math.cos(tilt);

      const bScale = focalLength / (focalLength + bz2);
      const bProjX = centerX + bx1 * bScale;
      const bProjY = centerY + by2 * bScale;

      // Only render target coordinates beacon when facing front (z <= 0)
      if (bz2 <= 0) {
        const pulse = (Math.sin(Date.now() * 0.006) + 1) / 2;
        
        // Concentric glow rings
        ctx.strokeStyle = `rgba(255, 107, 0, ${0.8 - pulse * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bProjX, bProjY, 6 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.arc(bProjX, bProjY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Glowing HUD Target reticle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bProjX - 25, bProjY);
        ctx.lineTo(bProjX - 12, bProjY);
        ctx.moveTo(bProjX + 12, bProjY);
        ctx.lineTo(bProjX + 25, bProjY);
        ctx.moveTo(bProjX, bProjY - 25);
        ctx.lineTo(bProjX, bProjY - 12);
        ctx.moveTo(bProjX, bProjY + 12);
        ctx.lineTo(bProjX, bProjY + 25);
        ctx.stroke();

        // Pulsating coordinate label box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(255, 107, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bProjX + 30, bProjY - 25, 110, 42, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#FF6B00';
        ctx.fillText('TARGET ACQUIRED', bProjX + 38, bProjY - 13);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('27°11\'21"N 84°11\'01"E', bProjX + 38, bProjY + 3);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Auto trigger descent zoom after 3.2 seconds
    const autoZoomTimer = setTimeout(() => {
      handleDescentTrigger();
    }, 3200);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(autoZoomTimer);
    };
  }, [viewMode]);

  const handleDescentTrigger = () => {
    setViewMode('zooming');
    // Start dramatic reentry flash at peak camera speed
    setTimeout(() => {
      setShowFlash(true);
    }, 550);

    // Finalize map landing
    setTimeout(() => {
      setViewMode('map');
      setShowFlash(false);
    }, 1100);
  };

  const handleResetZoom = () => {
    setViewMode('globe');
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 shadow-2xl relative">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: Globe View & Rotation */}
        {(viewMode === 'globe' || viewMode === 'zooming') && (
          <motion.div
            key="orbit-globe"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: viewMode === 'zooming' ? 8.5 : 1,
              filter: viewMode === 'zooming' ? 'blur(8px)' : 'blur(0px)'
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              scale: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
              filter: { duration: 0.9 }
            }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-radial-gradient from-slate-950 to-black z-10"
          >
            {/* Topography vector contour overlay behind globe */}
            <div className="absolute inset-0 opacity-10 bg-topography pointer-events-none"></div>

            <canvas ref={canvasRef} className="cursor-pointer max-w-full max-h-full" />
            
            {viewMode === 'globe' && (
              <div className="absolute bottom-8 left-0 right-0 text-center space-y-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-orange-950/80 text-orange-400 border border-orange-800/40 uppercase shadow-lg">
                  <Orbit className="w-3 h-3 animate-spin-slow" /> ORBITAL LOCK ACTIVE
                </span>
                <p className="text-white/60 text-xs font-semibold tracking-wide">Initiating descending orbital coordinate tracking...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PHASE 3: Precision Map Landing */}
        {viewMode === 'map' && (
          <motion.div
            key="precision-map"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
            <MapContainer 
              center={mahuaaCenter} 
              zoom={17} 
              scrollWheelZoom={false} 
              className="w-full h-full"
              style={{ height: '100%', width: '100%', minHeight: '420px' }}
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

            {/* Premium Glassmorphic Replay Orbital Descent Overlay HUD Button */}
            <div className="absolute bottom-5 right-5 z-[1000]">
              <button 
                onClick={handleResetZoom}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white font-extrabold text-xs tracking-wider uppercase bg-slate-900/85 backdrop-blur-md shadow-2xl hover:bg-slate-800 transition-all hover:scale-105"
              >
                <Compass className="w-4 h-4 animate-spin-slow text-orange-500" /> Replay Space-Descent
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Reentry Atmospheric Flare Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' }}
            className="absolute inset-0 bg-white dark:bg-orange-50 mix-blend-overlay z-[99] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
