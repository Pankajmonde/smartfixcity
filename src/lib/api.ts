
import { mockReports, getMockReportById, getFilteredReports } from '../data/mockData';
import { Report, ReportFormData, PriorityLevel, ReportType, ReportStatus } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate distance between two geographic points in meters using the Haversine formula
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if a report is a duplicate (same issue type within 50m)
const checkForDuplicateReports = (
  newReport: ReportFormData
): Report | null => {
  // Default threshold is 50 meters
  const DUPLICATE_THRESHOLD_METERS = 50;
  
  for (const report of mockReports) {
    // Skip resolved reports
    if (report.status === 'resolved') {
      continue;
    }
    
    // Check if same type
    if (report.type !== newReport.type) {
      continue;
    }
    
    // Calculate distance between reports
    const distance = calculateDistance(
      report.location.lat,
      report.location.lng,
      newReport.location.lat,
      newReport.location.lng
    );
    
    // If within threshold, consider it a duplicate
    if (distance <= DUPLICATE_THRESHOLD_METERS) {
      return report;
    }
  }
  
  return null;
};

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
  
  // Check for duplicate reports
  const duplicateReport = checkForDuplicateReports(reportData);
  if (duplicateReport) {
    throw new Error(`DUPLICATE:${duplicateReport.id}`);
  }
  
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
  mockReports.push(newReport);
  
  return newReport;
};

// Update an existing report
export const updateReportStatus = async (
  reportId: string, 
  status: ReportStatus
): Promise<Report> => {
  await delay(800);
  
  // Find the report in the mock data
  const reportIndex = mockReports.findIndex(r => r.id === reportId);
  
  if (reportIndex === -1) {
    throw new Error(`Report with ID ${reportId} not found`);
  }
  
  // Update the report status
  mockReports[reportIndex] = {
    ...mockReports[reportIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  return mockReports[reportIndex];
};
