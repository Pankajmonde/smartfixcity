
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import AdminReportTable from '@/components/AdminReportTable';
import { Report, ReportStatus, PriorityLevel, ReportType } from '@/types';
import { fetchReports, updateReportStatus, deleteReport, fetchFilteredReports } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, LogOut, ShieldAlert, Trash2, AlertCircle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ReportForm from '@/components/ReportForm';
import { ReportFormData } from '@/types';
import { submitReport } from '@/lib/api';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import ReportFilters from '@/components/ReportFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isAuthLoading, logout } = useAdminAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFilterChange = async (filters: {
    status?: ReportStatus;
    priority?: PriorityLevel;
    type?: ReportType;
  }) => {
    setIsLoading(true);
    try {
      const data = await fetchFilteredReports(filters.status, filters.priority, filters.type);
      setReports(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error filtering reports:', error);
      toast.error('Failed to filter reports');
    } finally {
      setIsLoading(false);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and update city infrastructure reports
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-md border border-amber-200">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Admin Access</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
                <AdminReportTable 
                  reports={reports} 
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  onDeleteClick={handleDeleteClick}
                />
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
                        <RechartsTooltip />
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
                        <RechartsTooltip />
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
              Only pending reports can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboardPage;
