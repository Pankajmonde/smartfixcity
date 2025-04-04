
import { Report, ReportType, PriorityLevel, ReportStatus } from '../types';
import { reportsCollection } from '../lib/mongodb';
import { fetchReports, fetchReportById, fetchFilteredReports } from '../lib/api';

// Initialize sample data
const addSampleReports = async () => {
  // Check if we already have reports
  const existingReports = await reportsCollection.find();
  
  if (existingReports.length === 0) {
    console.log("Adding sample reports to mock database");
    
    const sampleReports: Partial<Report>[] = [
      {
        type: "pothole",
        description: "Large pothole on MG Road near Apollo Hospital causing traffic delays and potential damage to vehicles.",
        location: {
          lat: 12.9716, 
          lng: 77.5946,
          address: "MG Road, Bangalore"
        },
        priority: "high",
        status: "pending",
        images: ["/images/pothole.jpg"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emergency: false
      },
      {
        type: "water_leak",
        description: "Water pipe leakage at Nehru Place resulting in water wastage and road damage.",
        location: {
          lat: 28.5483, 
          lng: 77.2546,
          address: "Nehru Place, Delhi"
        },
        priority: "medium",
        status: "investigating",
        images: ["/images/water-leak.jpg"],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        emergency: false
      },
      {
        type: "street_light",
        description: "Street light not working at Hill Road, Bandra causing safety concerns for residents in the evening.",
        location: {
          lat: 19.0596, 
          lng: 72.8295,
          address: "Hill Road, Bandra, Mumbai"
        },
        priority: "low",
        status: "pending",
        images: ["/images/street-light.jpg"],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        emergency: false
      },
      {
        type: "trash",
        description: "Overflowing garbage bins at 80 Feet Road, Koramangala creating unsanitary conditions and foul smell.",
        location: {
          lat: 12.9352, 
          lng: 77.6245,
          address: "80 Feet Road, Koramangala, Bangalore"
        },
        priority: "medium",
        status: "pending",
        images: ["/images/trash.jpg"],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        emergency: false
      },
      {
        type: "traffic_light",
        description: "Malfunctioning traffic signal at India Gate junction causing traffic congestion.",
        location: {
          lat: 28.6129, 
          lng: 77.2295,
          address: "India Gate, Delhi"
        },
        priority: "high",
        status: "pending",
        images: ["/images/traffic-light.jpg"],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        emergency: true
      }
    ];
    
    await reportsCollection.insertMany(sampleReports);
    console.log("Sample reports added successfully");
  }
};

// Call to add sample reports
addSampleReports();

// These functions now just call the API functions that interact with our mock database
export const getMockReportById = async (id: string): Promise<Report | undefined> => {
  const report = await fetchReportById(id);
  return report || undefined;
};

export const getFilteredReports = async (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Promise<Report[]> => {
  return fetchFilteredReports(status, priority, type);
};

// Generate issue descriptions for India (kept for reference)
export const getIssueDescription = (type: ReportType, location: string): string => {
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
