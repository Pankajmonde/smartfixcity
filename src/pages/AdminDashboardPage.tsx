
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import AdminReportTable from '@/components/AdminReportTable';
import { Report, ReportStatus } from '@/types';
import { fetchReports, updateReportStatus } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportForm from '@/components/ReportForm';
import { ReportFormData } from '@/types';
import { submitReport } from '@/lib/api';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadReports();
  }, []);
  
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
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
  
  const handleEmergencySubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      await submitReport({ ...data, emergency: true });
      toast.success('Emergency report submitted successfully');
      setIsEmergencyDialogOpen(false);
      
      // Refresh reports
      loadReports();
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      toast.error('Failed to submit emergency report');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewDetails = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onEmergencyClick={handleEmergencyClick} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and update city infrastructure reports
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">Admin Access</span>
            </div>
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
              <p className="text-muted-foreground">No reports found</p>
            </div>
          ) : (
            <AdminReportTable 
              reports={reports} 
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </main>
      
      {/* Emergency Report Dialog */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[80vh] overflow-y-auto">
            <ReportForm 
              onSubmit={handleEmergencySubmit} 
              isSubmitting={isSubmitting}
              isEmergency={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
