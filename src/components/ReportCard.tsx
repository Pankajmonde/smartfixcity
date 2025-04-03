
import { Report } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import ReportTypeBadge from './ReportTypeBadge';
import ReportStatusBadge from './ReportStatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDistanceToNow } from 'date-fns';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

const ReportCard = ({ report, onClick }: ReportCardProps) => {
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      } ${report.emergency ? 'border-red-300' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        {report.images.length > 0 && (
          <img 
            src={report.images[0]} 
            alt={`Report of ${report.type}`}
            className="w-full h-36 object-cover"
          />
        )}
        
        {report.emergency && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              EMERGENCY
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <ReportTypeBadge type={report.type} />
          <ReportStatusBadge status={report.status} />
          <PriorityBadge priority={report.priority} />
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{report.description}</h3>
        
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{report.location.address || 'Location unspecified'}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
