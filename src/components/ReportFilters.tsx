
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { ReportStatus, PriorityLevel, ReportType } from '../types';
import { X } from 'lucide-react';

interface ReportFiltersProps {
  onFilterChange: (filters: {
    status?: ReportStatus;
    priority?: PriorityLevel;
    type?: ReportType;
  }) => void;
}

const ReportFilters = ({ onFilterChange }: ReportFiltersProps) => {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<ReportType | undefined>(undefined);
  
  const handleStatusChange = (value: ReportStatus | '') => {
    const newValue = value === '' ? undefined : value;
    setStatusFilter(newValue);
    onFilterChange({
      status: newValue,
      priority: priorityFilter,
      type: typeFilter,
    });
  };
  
  const handlePriorityChange = (value: PriorityLevel | '') => {
    const newValue = value === '' ? undefined : value;
    setPriorityFilter(newValue);
    onFilterChange({
      status: statusFilter,
      priority: newValue,
      type: typeFilter,
    });
  };
  
  const handleTypeChange = (value: ReportType | '') => {
    const newValue = value === '' ? undefined : value;
    setTypeFilter(newValue);
    onFilterChange({
      status: statusFilter,
      priority: priorityFilter,
      type: newValue,
    });
  };
  
  const clearFilters = () => {
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setTypeFilter(undefined);
    onFilterChange({});
  };
  
  const hasFilters = statusFilter !== undefined || priorityFilter !== undefined || typeFilter !== undefined;
  
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="w-full sm:w-auto">
          <Select
            value={statusFilter || ''}
            onValueChange={(value) => handleStatusChange(value as ReportStatus | '')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={priorityFilter || ''}
            onValueChange={(value) => handlePriorityChange(value as PriorityLevel | '')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={typeFilter || ''}
            onValueChange={(value) => handleTypeChange(value as ReportType | '')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="pothole">Pothole</SelectItem>
              <SelectItem value="water_leak">Water Leak</SelectItem>
              <SelectItem value="street_light">Street Light</SelectItem>
              <SelectItem value="graffiti">Graffiti</SelectItem>
              <SelectItem value="trash">Trash</SelectItem>
              <SelectItem value="sidewalk">Sidewalk</SelectItem>
              <SelectItem value="traffic_light">Traffic Light</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReportFilters;
