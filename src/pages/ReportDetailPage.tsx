
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ReportDetail from '@/components/ReportDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchReportById, submitReport } from '@/lib/api';
import { Report, ReportFormData } from '@/types';
import { AlertTriangle, Loader2 } from 'lucide-react';
import ReportForm from '@/components/ReportForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchReportById(id);
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReport();
  }, [id]);
  
  const handleBack = () => {
    navigate(-1);
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
      navigate('/dashboard');
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-city-primary mb-2" />
              <p className="text-muted-foreground">Loading report details...</p>
            </div>
          </div>
        ) : report ? (
          <ReportDetail report={report} onBack={handleBack} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Report not found</p>
          </div>
        )}
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

export default ReportDetailPage;
