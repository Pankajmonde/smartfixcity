
import { Report, ReportType, PriorityLevel, ReportStatus } from '../types';

// Generate more realistic issue descriptions for India
const getIssueDescription = (type: ReportType, location: string): string => {
  switch (type) {
    case 'pothole':
      return `Large pothole on the road near ${location} causing traffic delays and potential damage to vehicles.`;
    case 'water_leak':
      return `Water pipe leakage at ${location} resulting in water wastage and road damage.`;
    case 'street_light':
      return `Street light not working at ${location} causing safety concerns for residents in the evening.`;
    case 'graffiti':
      return `Unauthorized graffiti on public wall at ${location} affecting the area's appearance.`;
    case 'trash':
      return `Overflowing garbage bins at ${location} creating unsanitary conditions and foul smell.`;
    case 'sidewalk':
      return `Broken sidewalk pavement at ${location} posing risk to pedestrians, especially elderly.`;
    case 'traffic_light':
      return `Malfunctioning traffic signal at ${location} junction causing traffic congestion.`;
    case 'emergency':
      return `Urgent issue at ${location} requiring immediate attention from authorities.`;
    default:
      return `Civic issue reported at ${location} requiring municipal attention.`;
  }
};

// Define predefined issues in major Indian cities
export const predefinedReports: Report[] = [
  // Delhi
  {
    id: 'report-delhi-1',
    type: 'pothole',
    description: getIssueDescription('pothole', 'Connaught Place'),
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: 'Connaught Place, New Delhi, Delhi 110001'
    },
    images: ['/images/pothole.jpg'],
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    userId: 'user-delhi-1',
    emergency: false,
    aiAnalysis: {
      suggestedType: 'pothole',
      suggestedPriority: 'high',
      confidence: 0.95,
      description: 'AI detected a pothole issue with high priority.'
    }
  },
  // Mumbai
  {
    id: 'report-mumbai-1',
    type: 'water_leak',
    description: getIssueDescription('water_leak', 'Bandra'),
    location: {
      lat: 19.0596,
      lng: 72.8295,
      address: 'Bandra West, Mumbai, Maharashtra 400050'
    },
    images: ['/images/water-leak.jpg'],
    priority: 'medium',
    status: 'investigating',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    userId: 'user-mumbai-1',
    emergency: false,
    aiAnalysis: {
      suggestedType: 'water_leak',
      suggestedPriority: 'medium',
      confidence: 0.88,
      description: 'AI detected a water leak issue with medium priority.'
    }
  },
  // Bengaluru
  {
    id: 'report-bengaluru-1',
    type: 'street_light',
    description: getIssueDescription('street_light', 'Koramangala'),
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala, Bengaluru, Karnataka 560034'
    },
    images: ['/images/street-light.jpg'],
    priority: 'low',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    userId: 'user-bengaluru-1',
    emergency: false,
    aiAnalysis: {
      suggestedType: 'street_light',
      suggestedPriority: 'low',
      confidence: 0.92,
      description: 'AI detected a street light issue with low priority.'
    }
  }
];

// Function to get a single report by ID
export const getMockReportById = (id: string): Report | undefined => {
  return predefinedReports.find(report => report.id === id);
};

// Function to get filtered reports
export const getFilteredReports = (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Report[] => {
  return predefinedReports.filter(report => {
    if (status && report.status !== status) return false;
    if (priority && report.priority !== priority) return false;
    if (type && report.type !== type) return false;
    return true;
  });
};
