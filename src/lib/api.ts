
import { mockReports, getMockReportById, getFilteredReports } from '../data/mockData';
import { Report, ReportFormData, PriorityLevel, ReportType, ReportStatus } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const fetchReports = async (): Promise<Report[]> => {
  await delay(800); // Simulate network delay
  return [...mockReports];
};

export const fetchReportById = async (id: string): Promise<Report | null> => {
  await delay(500);
  const report = getMockReportById(id);
  return report || null;
};

export const fetchFilteredReports = async (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Promise<Report[]> => {
  await delay(800);
  return getFilteredReports(status, priority, type);
};

// Simulate AI analysis of images
export const analyzeImage = async (image: File): Promise<{
  suggestedType: ReportType;
  suggestedPriority: PriorityLevel;
  confidence: number;
  description: string;
}> => {
  await delay(1500); // Simulate AI processing time
  
  // In a real application, we would send the image to an AI service
  // For this demo, we'll return mock data based on the image name
  const imageName = image.name.toLowerCase();
  
  let suggestedType: ReportType = 'other';
  let suggestedPriority: PriorityLevel = 'medium';
  
  if (imageName.includes('pothole')) {
    suggestedType = 'pothole';
    suggestedPriority = 'medium';
  } else if (imageName.includes('water') || imageName.includes('leak')) {
    suggestedType = 'water_leak';
    suggestedPriority = 'high';
  } else if (imageName.includes('light')) {
    suggestedType = 'street_light';
    suggestedPriority = 'low';
  } else if (imageName.includes('graffiti')) {
    suggestedType = 'graffiti';
    suggestedPriority = 'low';
  } else if (imageName.includes('trash')) {
    suggestedType = 'trash';
    suggestedPriority = 'medium';
  } else if (imageName.includes('sidewalk')) {
    suggestedType = 'sidewalk';
    suggestedPriority = 'medium';
  } else if (imageName.includes('traffic')) {
    suggestedType = 'traffic_light';
    suggestedPriority = 'high';
  } else if (imageName.includes('emergency') || imageName.includes('fire') || imageName.includes('gas')) {
    suggestedType = 'emergency';
    suggestedPriority = 'high';
  }
  
  return {
    suggestedType,
    suggestedPriority,
    confidence: 0.7 + Math.random() * 0.3, // Random confidence between 0.7 and 1.0
    description: `AI analysis suggests this is a ${suggestedType.replace('_', ' ')} issue with ${suggestedPriority} priority.`
  };
};

// Submit a new report
export const submitReport = async (reportData: ReportFormData): Promise<Report> => {
  await delay(1000); // Simulate network delay
  
  // Convert File objects to URLs (in a real app, we would upload these to a server)
  const imageUrls = reportData.images.map(image => URL.createObjectURL(image));
  
  // Create a new report with the data
  const newReport: Report = {
    id: `report-${Date.now()}`,
    type: reportData.type,
    description: reportData.description,
    location: reportData.location,
    images: imageUrls,
    priority: reportData.emergency ? 'high' : 'medium', // Default to medium unless emergency
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emergency: reportData.emergency,
    // In a real app, we would include the logged-in user's ID
    userId: 'current-user',
    // In a real app, AI analysis would be done on the server
    aiAnalysis: {
      suggestedType: reportData.type,
      suggestedPriority: reportData.emergency ? 'high' : 'medium',
      confidence: 0.9,
      description: `AI detected a ${reportData.type.replace('_', ' ')} issue.`
    }
  };
  
  // In a real app, we would send this to an API and get back the created report
  return newReport;
};

// Update an existing report
export const updateReportStatus = async (
  reportId: string, 
  status: ReportStatus
): Promise<Report> => {
  await delay(800);
  
  const report = getMockReportById(reportId);
  if (!report) {
    throw new Error(`Report with ID ${reportId} not found`);
  }
  
  const updatedReport = {
    ...report,
    status,
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, we would update the report in the database
  return updatedReport;
};
