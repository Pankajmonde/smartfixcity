
import { Report, ReportType, PriorityLevel, ReportStatus } from '../types';
import { addSampleReports, fetchReports, fetchReportById, fetchFilteredReports } from '../lib/api';

// Initialize sample data
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

// These predefined reports are kept for reference but not used directly anymore
export const predefinedReports: Report[] = [];
