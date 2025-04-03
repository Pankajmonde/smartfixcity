
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report } from '../types';
import ReportTypeBadge from './ReportTypeBadge';
import ReportStatusBadge from './ReportStatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

// Fix Leaflet icon issue in React
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Set up default icon for leaflet
const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

// Create custom icons for different priority levels
const createPriorityIcon = (priority: string, isEmergency: boolean = false) => {
  const iconUrl = markerIconUrl;
  const iconSize = isEmergency ? [35, 45] : [25, 41];
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${priority === 'high' ? '#E53935' : priority === 'medium' ? '#FB8C00' : '#43A047'};
        width: ${isEmergency ? '20px' : '15px'};
        height: ${isEmergency ? '20px' : '15px'};
        border-radius: 50%;
        position: absolute;
        top: ${isEmergency ? '2px' : '4px'};
        left: ${isEmergency ? '8px' : '5px'};
        border: 2px solid white;
      "></div>
      <img src="${iconUrl}" width="${iconSize[0]}" height="${iconSize[1]}" />
      ${isEmergency ? '<div style="position: absolute; top: -10px; right: -10px; background: #E53935; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>' : ''}
    `,
    iconSize: iconSize,
    iconAnchor: [isEmergency ? 17 : 12, isEmergency ? 45 : 41],
    popupAnchor: [1, -34],
  });
};

interface ReportMapProps {
  reports: Report[];
  onMarkerClick?: (reportId: string) => void;
  height?: string;
  width?: string;
  className?: string;
}

const ReportMap = ({ reports, onMarkerClick, height = '600px', width = '100%', className = '' }: ReportMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  
  // Calculate center of the map based on report locations
  useEffect(() => {
    if (reports.length > 0) {
      const totalLat = reports.reduce((sum, report) => sum + report.location.lat, 0);
      const totalLng = reports.reduce((sum, report) => sum + report.location.lng, 0);
      
      setMapCenter([totalLat / reports.length, totalLng / reports.length]);
    }
  }, [reports]);
  
  return (
    <div style={{ height, width }} className={className}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createPriorityIcon(report.priority, report.emergency)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(report.id);
                }
              }
            }}
          >
            <Popup>
              <div className="w-56 p-1">
                {report.images.length > 0 && (
                  <img 
                    src={report.images[0]} 
                    alt={report.description}
                    className="w-full h-24 object-cover mb-2 rounded"
                  />
                )}
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <ReportTypeBadge type={report.type} showIcon={false} />
                  <ReportStatusBadge status={report.status} />
                </div>
                
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{report.description}</h3>
                
                <div className="text-xs text-muted-foreground">
                  <p>{report.location.address}</p>
                  <p>Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</p>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <PriorityBadge priority={report.priority} />
                  
                  {report.emergency && (
                    <div className="flex items-center text-xs font-semibold text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Emergency
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportMap;
