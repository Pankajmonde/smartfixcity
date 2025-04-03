
export type ReportStatus = 'pending' | 'investigating' | 'in_progress' | 'resolved';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type ReportType = 
  | 'pothole' 
  | 'water_leak' 
  | 'street_light' 
  | 'graffiti' 
  | 'trash' 
  | 'sidewalk' 
  | 'traffic_light'
  | 'emergency'
  | 'other';

export interface Report {
  id: string;
  type: ReportType;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  images: string[];
  priority: PriorityLevel;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  aiAnalysis?: {
    suggestedType?: ReportType;
    suggestedPriority?: PriorityLevel;
    confidence: number;
    description?: string;
  };
  emergency: boolean;
}

export interface ReportFormData {
  type: ReportType;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  images: File[];
  emergency: boolean;
}
