
import { useState } from 'react';
import { Report, ReportStatus } from '../types';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import ReportTypeBadge from './ReportTypeBadge';
import ReportStatusBadge from './ReportStatusBadge';
import PriorityBadge from './PriorityBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, AlertTriangle } from 'lucide-react';

interface AdminReportTableProps {
  reports: Report[];
  onStatusChange: (reportId: string, status: ReportStatus) => void;
  onViewDetails: (reportId: string) => void;
}

const AdminReportTable = ({ reports, onStatusChange, onViewDetails }: AdminReportTableProps) => {
  // Sort reports by emergency first, then by date (newest first)
  const sortedReports = [...reports].sort((a, b) => {
    if (a.emergency && !b.emergency) return -1;
    if (!a.emergency && b.emergency) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleStatusChange = (reportId: string, newStatus: string) => {
    onStatusChange(reportId, newStatus as ReportStatus);
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all reported issues</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[180px]">Actions</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.map((report) => (
            <TableRow 
              key={report.id}
              className={report.emergency ? 'bg-red-50' : ''}
            >
              <TableCell>
                <ReportTypeBadge type={report.type} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[200px]">
                    {report.emergency && (
                      <AlertTriangle className="inline-block h-4 w-4 mr-1 text-red-500" />
                    )}
                    {report.description}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {report.location.address}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <PriorityBadge priority={report.priority} />
              </TableCell>
              <TableCell>
                <ReportStatusBadge status={report.status} />
              </TableCell>
              <TableCell>
                <Select
                  value={report.status}
                  onValueChange={(value) => handleStatusChange(report.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDetails(report.id)}
                  className="flex items-center"
                >
                  <span className="sr-only">View details</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminReportTable;
