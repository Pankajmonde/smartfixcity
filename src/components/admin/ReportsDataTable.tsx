
import { useState } from 'react';
import { Report } from '@/types';
import { Loader2 } from 'lucide-react';
import AdminReportTable from '@/components/AdminReportTable';
import ReportFilters from '@/components/ReportFilters';
import { ReportStatus, PriorityLevel, ReportType } from '@/types';
import { fetchFilteredReports } from '@/lib/api';

interface ReportsDataTableProps {
  reports: Report[];
  isLoading: boolean;
  setReports: (reports: Report[]) => void;
  calculateStats: (reports: Report[]) => void;
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void;
  onViewDetails: (reportId: string) => void;
  onDeleteClick: (reportId: string) => void;
}

export const ReportsDataTable = ({
  reports,
  isLoading,
  setReports,
  calculateStats,
  onStatusChange,
  onViewDetails,
  onDeleteClick
}: ReportsDataTableProps) => {
  const handleFilterChange = async (filters: {
    status?: ReportStatus;
    priority?: PriorityLevel;
    type?: ReportType;
  }) => {
    try {
      const data = await fetchFilteredReports(filters.status, filters.priority, filters.type);
      setReports(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error filtering reports:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <ReportFilters onFilterChange={handleFilterChange} />
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-city-primary mb-2" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No reports found matching the filters</p>
        </div>
      ) : (
        <AdminReportTable 
          reports={reports} 
          onStatusChange={onStatusChange}
          onViewDetails={onViewDetails}
          onDeleteClick={onDeleteClick}
        />
      )}
    </div>
  );
};

export default ReportsDataTable;
