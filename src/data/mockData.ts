
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
        title: "Dangerous pothole on MG Road",
        description: "Large pothole on MG Road near Apollo Hospital causing traffic delays and potential damage to vehicles.",
        type: "pothole",
        priority: "high",
        status: "open",
        location: "MG Road, Bangalore",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        reporter: "Rajesh Kumar",
        reporterContact: "rajesh.kumar@example.com",
        dateReported: new Date().toISOString(),
        upvotes: 15,
        imageUrl: "/images/pothole.jpg"
      },
      {
        title: "Water leak at Nehru Place",
        description: "Water pipe leakage at Nehru Place resulting in water wastage and road damage.",
        type: "water_leak",
        priority: "medium",
        status: "in_progress",
        location: "Nehru Place, Delhi",
        coordinates: { lat: 28.5483, lng: 77.2546 },
        reporter: "Priya Singh",
        reporterContact: "priya.singh@example.com",
        dateReported: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        upvotes: 7,
        imageUrl: "/images/water-leak.jpg"
      },
      {
        title: "Street light not working in Bandra",
        description: "Street light not working at Hill Road, Bandra causing safety concerns for residents in the evening.",
        type: "street_light",
        priority: "low",
        status: "open",
        location: "Hill Road, Bandra, Mumbai",
        coordinates: { lat: 19.0596, lng: 72.8295 },
        reporter: "Amit Patel",
        reporterContact: "amit.patel@example.com",
        dateReported: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        upvotes: 3,
        imageUrl: "/images/street-light.jpg"
      },
      {
        title: "Garbage overflow in Koramangala",
        description: "Overflowing garbage bins at 80 Feet Road, Koramangala creating unsanitary conditions and foul smell.",
        type: "trash",
        priority: "medium",
        status: "open",
        location: "80 Feet Road, Koramangala, Bangalore",
        coordinates: { lat: 12.9352, lng: 77.6245 },
        reporter: "Deepa Nair",
        reporterContact: "deepa.nair@example.com",
        dateReported: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        upvotes: 9,
        imageUrl: "/images/trash.jpg"
      },
      {
        title: "Broken traffic signal near India Gate",
        description: "Malfunctioning traffic signal at India Gate junction causing traffic congestion.",
        type: "traffic_light",
        priority: "high",
        status: "open",
        location: "India Gate, Delhi",
        coordinates: { lat: 28.6129, lng: 77.2295 },
        reporter: "Vikram Sharma",
        reporterContact: "vikram.sharma@example.com",
        dateReported: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        upvotes: 12,
        imageUrl: "/images/traffic-light.jpg"
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
