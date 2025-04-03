
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ReportForm from '@/components/ReportForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReportFormData } from '@/types';
import { submitReport } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReportPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  
  const handleSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      await submitReport(data);
      toast.success('Report submitted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Report an Issue</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>
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

export default ReportPage;
