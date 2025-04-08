
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Report, ReportStatus } from '@/types';
import { fetchReports, updateReportStatus, deleteReport } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/hooks/use-admin-auth';

// Imported refactored components
import StatisticsCards from '@/components/admin/StatisticsCards';
import ReportsDataTable from '@/components/admin/ReportsDataTable';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import EmergencyReportDialog from '@/components/admin/EmergencyReportDialog';
import DeleteReportDialog from '@/components/admin/DeleteReportDialog';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isAuthLoading, logout } = useAdminAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    emergencies: 0,
  });
  
  // Calculate statistics
  const calculateStats = (reports: Report[]) => {
    const newStats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      investigating: reports.filter(r => r.status === 'investigating').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      highPriority: reports.filter(r => r.priority === 'high').length,
      emergencies: reports.filter(r => r.emergency).length,
    };
    
    setStats(newStats);
  };
  
  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
  }, [isAdmin]);
  
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      
      // Update the report in the local state
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus, updatedAt: new Date().toISOString() } : report
      ));
      
      toast.success(`Report status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };
  
  const handleEmergencyClick = () => {
    setIsEmergencyDialogOpen(true);
  };
  
  const handleViewDetails = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };

  const handleDeleteClick = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    
    // Only allow deleting pending reports
    if (report && report.status !== 'pending') {
      toast.error('Only pending reports can be deleted');
      return;
    }
    
    setReportToDelete(reportId);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteReport(reportToDelete);
      
      // Remove the report from local state
      setReports(reports.filter(report => report.id !== reportToDelete));
      
      toast.success('Report deleted successfully');
      setIsDeleteConfirmOpen(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-city-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, the useAdminAuth hook will redirect
  if (!isAdmin) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onEmergencyClick={handleEmergencyClick} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <AdminHeader onLogout={logout} />
          
          {/* Stats cards */}
          <StatisticsCards stats={stats} />
          
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="py-4">
              <ReportsDataTable 
                reports={reports}
                isLoading={isLoading}
                setReports={setReports}
                calculateStats={calculateStats}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="py-4">
              <AnalyticsCharts reports={reports} stats={stats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Emergency Report Dialog */}
      <EmergencyReportDialog 
        isOpen={isEmergencyDialogOpen}
        onOpenChange={setIsEmergencyDialogOpen}
        onReportsUpdated={loadReports}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteReportDialog 
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminDashboardPage;
