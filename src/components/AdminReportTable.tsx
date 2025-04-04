
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Report, ReportStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import ReportTypeBadge from './ReportTypeBadge';
import ReportStatusBadge from './ReportStatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AdminReportTableProps {
  reports: Report[];
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void;
  onViewDetails: (reportId: string) => void;
  onDeleteClick?: (reportId: string) => void;
}

const AdminReportTable = ({ 
  reports, 
  onStatusChange, 
  onViewDetails,
  onDeleteClick
}: AdminReportTableProps) => {
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  
  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setUpdateLoading(reportId);
    try {
      await onStatusChange(reportId, newStatus);
    } finally {
      setUpdateLoading(null);
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-mono text-xs">
                {report.id.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <ReportTypeBadge type={report.type} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={report.description}>
                {report.description}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={report.location.address}>
                {report.location.address}
              </TableCell>
              <TableCell>
                <Select 
                  defaultValue={report.status} 
                  onValueChange={(value) => handleStatusChange(report.id, value as ReportStatus)}
                  disabled={updateLoading === report.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <ReportStatusBadge status={report.status} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <ReportStatusBadge status="pending" />
                    </SelectItem>
                    <SelectItem value="investigating">
                      <ReportStatusBadge status="investigating" />
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <ReportStatusBadge status="in_progress" />
                    </SelectItem>
                    <SelectItem value="resolved">
                      <ReportStatusBadge status="resolved" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={report.priority} />
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onViewDetails(report.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {onDeleteClick && report.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteClick(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminReportTable;
