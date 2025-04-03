
import { ReportType } from '../types';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Water, Lightbulb, Graffiti, Trash2, Road, StopCircle, AlertTriangle, HelpCircle
} from 'lucide-react';

interface ReportTypeBadgeProps {
  type: ReportType;
  className?: string;
  showIcon?: boolean;
}

const ReportTypeBadge = ({ type, className = '', showIcon = true }: ReportTypeBadgeProps) => {
  const getTypeDetails = (type: ReportType) => {
    switch (type) {
      case 'pothole':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          label: 'Pothole',
          icon: Road
        };
      case 'water_leak':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          label: 'Water Leak',
          icon: Water
        };
      case 'street_light':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          label: 'Street Light',
          icon: Lightbulb
        };
      case 'graffiti':
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-200', 
          label: 'Graffiti',
          icon: Graffiti
        };
      case 'trash':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          label: 'Trash',
          icon: Trash2
        };
      case 'sidewalk':
        return { 
          color: 'bg-slate-100 text-slate-800 border-slate-200', 
          label: 'Sidewalk',
          icon: Road
        };
      case 'traffic_light':
        return { 
          color: 'bg-rose-100 text-rose-800 border-rose-200', 
          label: 'Traffic Light',
          icon: StopCircle
        };
      case 'emergency':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          label: 'Emergency',
          icon: AlertTriangle
        };
      case 'other':
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          label: 'Other',
          icon: HelpCircle
        };
    }
  };

  const { color, label, icon: Icon } = getTypeDetails(type);

  return (
    <Badge className={`${color} ${className} font-medium`} variant="outline">
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
};

export default ReportTypeBadge;
