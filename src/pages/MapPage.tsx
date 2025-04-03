
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ReportMap from '@/components/ReportMap';
import ReportFilters from '@/components/ReportFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchReports, fetchFilteredReports, submitReport } from '@/lib/api';
import { Report, ReportStatus, PriorityLevel, ReportType, ReportFormData } from '@/types';
import { AlertTriangle, Loader2 } from 'lucide-react';
import ReportForm from '@/components/ReportForm';
import { toast } from 'sonner';

const MapPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
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
    
    loadReports();
  }, []);
  
  const handleFilterChange = async (filters: {
    status?: ReportStatus;
    priority?: PriorityLevel;
    type?: ReportType;
  }) => {
    setIsLoading(true);
    try {
      const data = await fetchFilteredReports(filters.status, filters.priority, filters.type);
      setReports(data);
    } catch (error) {
      console.error('Error filtering reports:', error);
      toast.error('Failed to filter reports');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkerClick = (reportId: string) => {
    navigate(`/report/${reportId}`);
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
      const newReports = await fetchReports();
      setReports(newReports);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      toast.error('Failed to submit emergency report');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onEmergencyClick={handleEmergencyClick} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">City Issues Map</h1>
              <p className="text-muted-foreground">
                View and filter all reported issues on the interactive map
              </p>
            </div>
            
            <ReportFilters onFilterChange={handleFilterChange} />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-city-primary mb-2" />
                <p className="text-muted-foreground">Loading map data...</p>
              </div>
            </div>
          ) : (
            <ReportMap
              reports={reports}
              onMarkerClick={handleMarkerClick}
              height="calc(100vh - 180px)"
              className="rounded-lg border"
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

export default MapPage;
