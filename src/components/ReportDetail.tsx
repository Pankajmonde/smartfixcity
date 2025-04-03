
import { Report } from '../types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin, Calendar, ArrowLeft, AlertTriangle, Brain,
  ChevronRight, User, Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import ReportTypeBadge from './ReportTypeBadge';
import ReportStatusBadge from './ReportStatusBadge';
import PriorityBadge from './PriorityBadge';
import ReportMap from './ReportMap';

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
}

const ReportDetail = ({ report, onBack }: ReportDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        
        {report.emergency && (
          <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Emergency Report
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <ReportTypeBadge type={report.type} />
                <ReportStatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
              
              <h1 className="text-2xl font-bold mb-4">{report.description}</h1>
              
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{report.location.address || 'Location unspecified'}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    {' '} ({format(new Date(report.createdAt), 'PPP p')})
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Last updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                    {' '} ({format(new Date(report.updatedAt), 'PPP p')})
                  </span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Reported by User #{report.userId?.split('-')[1]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            
            <TabsContent value="images" className="mt-4">
              {report.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`Report image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-md border"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">No images available for this report</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map" className="mt-4">
              <ReportMap
                reports={[report]}
                height="400px"
                className="border rounded-md overflow-hidden"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Analysis
              </h2>
              
              {report.aiAnalysis ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md text-blue-800 text-sm">
                    {report.aiAnalysis.description}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Suggested Type:</span>
                      {report.aiAnalysis.suggestedType && (
                        <ReportTypeBadge type={report.aiAnalysis.suggestedType} />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Suggested Priority:</span>
                      {report.aiAnalysis.suggestedPriority && (
                        <PriorityBadge priority={report.aiAnalysis.suggestedPriority} />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="text-sm font-medium">
                        {(report.aiAnalysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No AI analysis available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Status Updates</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Report Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(report.createdAt), 'PPP p')}
                  </p>
                </div>
              </div>
              
              {report.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Started Investigation</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.updatedAt), 'PPP p')}
                    </p>
                  </div>
                </div>
              )}
              
              {(report.status === 'in_progress' || report.status === 'resolved') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Repair Work Started</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(new Date(report.updatedAt).getTime() - 3600000), 'PPP p')}
                    </p>
                  </div>
                </div>
              )}
              
              {report.status === 'resolved' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Issue Resolved</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.updatedAt), 'PPP p')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
