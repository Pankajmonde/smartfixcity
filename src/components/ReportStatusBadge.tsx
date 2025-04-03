
import { ReportStatus } from '../types';
import { Badge } from '@/components/ui/badge';

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const ReportStatusBadge = ({ status, className }: ReportStatusBadgeProps) => {
  const getStatusDetails = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' };
      case 'investigating':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Investigating' };
      case 'in_progress':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'In Progress' };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Resolved' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' };
    }
  };

  const { color, label } = getStatusDetails(status);

  return (
    <Badge className={`${color} ${className} font-medium`} variant="outline">
      {label}
    </Badge>
  );
};

export default ReportStatusBadge;
