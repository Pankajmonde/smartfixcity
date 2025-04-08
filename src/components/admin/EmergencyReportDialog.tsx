
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReportForm from '@/components/ReportForm';
import { toast } from 'sonner';
import { ReportFormData } from '@/types';
import { submitReport } from '@/lib/api';

interface EmergencyReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReportsUpdated: () => void;
}

export const EmergencyReportDialog = ({ 
  isOpen, 
  onOpenChange,
  onReportsUpdated 
}: EmergencyReportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmergencySubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      await submitReport({ ...data, emergency: true });
      toast.success('Emergency report submitted successfully');
      onOpenChange(false);
      
      // Refresh reports
      onReportsUpdated();
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      toast.error('Failed to submit emergency report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Report
          </DialogTitle>
          <DialogDescription>
            Submit an emergency report for immediate attention
          </DialogDescription>
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
  );
};

export default EmergencyReportDialog;
