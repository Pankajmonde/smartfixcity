
import { PriorityLevel } from '../types';
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const getPriorityDetails = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'High Priority' };
      case 'medium':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Medium Priority' };
      case 'low':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low Priority' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' };
    }
  };

  const { color, label } = getPriorityDetails(priority);

  return (
    <Badge className={`${color} ${className} font-medium`} variant="outline">
      {label}
    </Badge>
  );
};

export default PriorityBadge;
