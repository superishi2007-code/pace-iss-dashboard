import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useDashboard } from '../context/DashboardContext';
import { Users, Navigation, Activity } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ISSIcon = L.divIcon({
  className: 'iss-marker',
  html: `<div class="relative">
          <div class="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-25"></div>
          <div class="relative bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c.7 0 1.2-.6 1.2-1.3l-.2-4.7c0-.4-.2-.8-.5-1l-3.2-2c-.4-.3-.9-.1-1.1.4l-1 2.5-2.6.2c-.4 0-.8.3-1 .7l-2 3.2c-.3.4-.1.9.4 1.1l2.5 1 2.5 1c.4.1.9-.1 1.1-.5l.5-1.2 2.4-1.2c.4-.2.9-.1 1.2.3l.5 1.5c.2.5.7.8 1.3.8z"/><path d="M11 7l1 4"/><path d="M15 7l-1 4"/><path d="M8 7v4"/><path d="M19 7v4"/><path d="M7 4h11"/><path d="M7 7h11"/></svg>
          </div>
        </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to auto-center map when ISS moves
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const ISSMap = () => {
  const { issData } = useDashboard();
  const { position, speed, path, astronauts, loading } = issData;

  if (loading) {
    return (
      <div className="h-[400px] w-full glass rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Locating ISS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Navigation size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Position</p>
            <p className="text-lg font-bold">{position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°</p>
          </div>
        </div>
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Current Speed</p>
            <p className="text-lg font-bold">{Math.round(speed).toLocaleString()} km/h</p>
          </div>
        </div>
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Astronauts</p>
            <p className="text-lg font-bold">{astronauts.length} onboard</p>
          </div>
        </div>
      </div>

      <div className="h-[500px] w-full rounded-xl overflow-hidden relative shadow-lg">
        <MapContainer 
          center={[position.lat, position.lng]} 
          zoom={3} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={path} color="#3b66f5" weight={3} dashArray="5, 10" />
          <Marker position={[position.lat, position.lng]} icon={ISSIcon}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-blue-600">ISS Location</h3>
                <p>Lat: {position.lat.toFixed(4)}</p>
                <p>Lng: {position.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
          <ChangeView center={[position.lat, position.lng]} />
        </MapContainer>
      </div>

      <div className="glass p-4 rounded-xl">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Humans in Space</h3>
        <div className="flex flex-wrap gap-2">
          {astronauts.map((person, i) => (
            <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
              {person.name} ({person.craft})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ISSMap;
