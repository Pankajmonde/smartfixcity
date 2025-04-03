
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, AlertTriangle, Lightbulb, Droplet, Route, BarChart, MapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import EmergencyButton from '@/components/EmergencyButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportForm from '@/components/ReportForm';
import { ReportFormData } from '@/types';
import { submitReport } from '@/lib/api';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleEmergencyClick = () => {
    setIsEmergencyDialogOpen(true);
  };
  
  const handleReportIssueClick = () => {
    navigate('/report');
  };
  
  const handleMapViewClick = () => {
    navigate('/map');
  };
  
  const handleDashboardClick = () => {
    navigate('/dashboard');
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-city-primary to-blue-700 text-white">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Report Urban Issues, Improve Your City
            </h1>
            <p className="text-xl max-w-2xl mb-8">
              Help make your city better by reporting infrastructure problems like potholes, 
              water leaks, or street lights. Our AI-powered system connects citizens with city services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-city-primary hover:bg-gray-100"
                onClick={handleReportIssueClick}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Report an Issue
              </Button>
              
              <EmergencyButton 
                onClick={handleEmergencyClick} 
                className="py-3 px-6"
              />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-city-primary mb-4">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Report Problems</h3>
                <p className="text-muted-foreground">
                  Quickly report urban issues with photos and location. For urgent situations, 
                  use the emergency button.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <BarChart className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI examines your report and images to identify issues and suggest priority levels, 
                  helping city workers respond faster.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                  <MapIcon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Follow the status of your reports on our live map and dashboard. 
                  See when issues are being investigated and resolved.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Common Issues Section */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Common Issues You Can Report</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                    <Road className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Potholes</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Report road damage that can cause vehicle damage or accidents.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                    <Water className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Water Leaks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Report broken pipes, leaking hydrants, or water main issues.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mr-3">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Street Lights</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Report malfunctioning or damaged street lights to improve safety.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Emergencies</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Report urgent issues like gas leaks, downed power lines, or fires.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl bg-city-primary rounded-lg overflow-hidden shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="p-8 md:p-12 text-white md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Ready to improve your city?</h2>
                <p className="mb-6">
                  Join thousands of citizens making a difference by reporting urban issues. 
                  Start with the map view or submit your first report today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-white text-city-primary hover:bg-gray-100"
                    onClick={handleMapViewClick}
                  >
                    <MapIcon className="mr-2 h-4 w-4" />
                    View Issues Map
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={handleDashboardClick}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    See Dashboard
                  </Button>
                </div>
              </div>
              <div className="md:w-1/3 bg-blue-800 hidden md:block">
                {/* Decorative element */}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CityReport. Building better communities together.</p>
        </div>
      </footer>
      
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

export default Index;
