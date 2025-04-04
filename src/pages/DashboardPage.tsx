import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ReportCard from '@/components/ReportCard';
import ReportFilters from '@/components/ReportFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle, Loader2, AlertCircle, CheckCircle2, Clock, BarChart3
} from 'lucide-react';
import { Report, ReportStatus, PriorityLevel, ReportType, ReportFormData } from '@/types';
import { fetchReports, fetchFilteredReports, submitReport } from '@/lib/api';
import ReportForm from '@/components/ReportForm';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Get counts by type and status for charts
  const getTypeData = (reports: Report[]) => {
    const typeCounts: Record<string, number> = {};
    
    reports.forEach(report => {
      if (typeCounts[report.type]) {
        typeCounts[report.type]++;
      } else {
        typeCounts[report.type] = 1;
      }
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };
  
  const getStatusData = (reports: Report[]) => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      investigating: 0,
      in_progress: 0,
      resolved: 0,
    };
    
    reports.forEach(report => {
      statusCounts[report.status]++;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };
  
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
  
  const handleCardClick = (reportId: string) => {
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
      calculateStats(newReports);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      toast.error('Failed to submit emergency report');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Chart colors
  const COLORS = ['#1976D2', '#43A047', '#FB8C00', '#E53935', '#5E35B1', '#00ACC1', '#EC407A', '#FDD835'];
  const STATUS_COLORS = {
    pending: '#FB8C00',
    investigating: '#1976D2',
    'in progress': '#5E35B1',
    resolved: '#43A047',
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onEmergencyClick={handleEmergencyClick} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">City Report Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor and manage urban infrastructure reports
              </p>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All submitted reports
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.investigating + stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Being addressed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">
                  Completed issues
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="py-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map(report => (
                    <ReportCard 
                      key={report.id} 
                      report={report} 
                      onClick={() => handleCardClick(report.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issue Types Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Types</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTypeData(reports)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getTypeData(reports).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Status Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getStatusData(reports)}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value">
                          {getStatusData(reports).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Additional Statistics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">High Priority Issues</span>
                        <span className="text-3xl font-bold text-red-600">{stats.highPriority}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}% of total
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Emergency Reports</span>
                        <span className="text-3xl font-bold text-red-600">{stats.emergencies}</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.emergencies / stats.total) * 100) : 0}% of total
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Resolution Rate</span>
                        <span className="text-3xl font-bold text-green-600">
                          {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stats.resolved} of {stats.total} resolved
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
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

export default DashboardPage;
