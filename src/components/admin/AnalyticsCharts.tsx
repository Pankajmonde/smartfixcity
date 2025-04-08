
import { Report } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartsProps {
  reports: Report[];
  stats: {
    total: number;
    pending: number;
    investigating: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    emergencies: number;
  }
}

// Chart colors
const COLORS = ['#1976D2', '#43A047', '#FB8C00', '#E53935', '#5E35B1', '#00ACC1', '#EC407A', '#FDD835'];
const STATUS_COLORS = {
  pending: '#FB8C00',
  investigating: '#1976D2',
  'in progress': '#5E35B1',
  resolved: '#43A047',
};

export const AnalyticsCharts = ({ reports, stats }: AnalyticsChartsProps) => {
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

  return (
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
  );
};

export default AnalyticsCharts;
