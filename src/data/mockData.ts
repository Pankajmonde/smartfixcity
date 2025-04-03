
import { Report, ReportType, PriorityLevel, ReportStatus } from '../types';

// Set a fixed seed date
const baseDate = new Date('2025-04-01T10:00:00Z');

// Generate a random date within the last week from baseDate
const getRandomRecentDate = () => {
  const randomDays = Math.floor(Math.random() * 7);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(baseDate);
  date.setDate(date.getDate() - randomDays);
  date.setHours(date.getHours() - randomHours);
  date.setMinutes(date.getMinutes() - randomMinutes);
  
  return date.toISOString();
};

// Generate mock reports around a central point (adjustable)
const generateMockReports = (count: number, centerLat = 40.7128, centerLng = -74.0060): Report[] => {
  const reports: Report[] = [];
  
  const reportTypes: ReportType[] = ['pothole', 'water_leak', 'street_light', 'graffiti', 'trash', 'sidewalk', 'traffic_light', 'emergency', 'other'];
  const priorityLevels: PriorityLevel[] = ['high', 'medium', 'low'];
  const statuses: ReportStatus[] = ['pending', 'investigating', 'in_progress', 'resolved'];
  
  // Mock image URLs (placeholder images)
  const mockImages = [
    '/images/pothole.jpg',
    '/images/water-leak.jpg',
    '/images/street-light.jpg',
    '/images/graffiti.jpg',
    '/images/trash.jpg',
    '/images/sidewalk.jpg',
    '/images/traffic-light.jpg',
    '/images/emergency.jpg',
  ];
  
  for (let i = 0; i < count; i++) {
    // Generate random coordinates within roughly 3 miles of center point
    const latVariance = (Math.random() - 0.5) * 0.05;
    const lngVariance = (Math.random() - 0.5) * 0.05;
    
    const lat = centerLat + latVariance;
    const lng = centerLng + lngVariance;
    
    const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const priority = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];
    const createdAt = getRandomRecentDate();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000).toISOString(); // Random time after creation
    
    // For emergency reports, always set high priority
    const isEmergency = type === 'emergency' || (Math.random() > 0.9); // 10% chance of any report being emergency
    const adjustedPriority = isEmergency ? 'high' : priority;
    
    // Generate a more accurate status based on creation date and priority
    let status: ReportStatus;
    const daysSinceCreation = (new Date(baseDate).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 1 && adjustedPriority !== 'high') {
      status = 'pending';
    } else if (daysSinceCreation < 2 || adjustedPriority === 'high') {
      status = Math.random() > 0.5 ? 'investigating' : 'in_progress';
    } else {
      status = Math.random() > 0.3 ? 'resolved' : 'in_progress';
    }
    
    // For emergencies, adjust the status to be more responsive
    if (isEmergency && daysSinceCreation > 0.5) {
      status = Math.random() > 0.3 ? 'in_progress' : 'investigating';
    }
    
    // Generate a somewhat realistic description
    const descriptions = {
      pothole: [
        "Large pothole in the middle of the street causing traffic to swerve",
        "Deep pothole damaging car tires at intersection",
        "Several small potholes forming in a cluster"
      ],
      water_leak: [
        "Water leaking from fire hydrant creating puddle on sidewalk",
        "Constant water flowing from broken pipe",
        "Water main break flooding the street"
      ],
      street_light: [
        "Street light flickering continuously throughout the night",
        "Street light pole leaning dangerously",
        "Three consecutive street lights not working"
      ],
      graffiti: [
        "Offensive graffiti on public building",
        "Large graffiti tag covering bus stop",
        "Multiple buildings vandalized with similar graffiti"
      ],
      trash: [
        "Illegal dumping of construction materials",
        "Overflowing public trash bin attracting pests",
        "Litter scattered across park area"
      ],
      sidewalk: [
        "Cracked sidewalk creating tripping hazard",
        "Sidewalk completely blocked by fallen tree",
        "Uneven sidewalk panels due to tree roots"
      ],
      traffic_light: [
        "Traffic light stuck on red causing major delays",
        "Traffic light facing wrong direction after storm",
        "Pedestrian crossing signal not working"
      ],
      emergency: [
        "Gas smell coming from street grating",
        "Downed power line sparking on road",
        "Building structure appears unstable after vehicle collision"
      ],
      other: [
        "Abandoned vehicle blocking bike lane",
        "Public bench broken and unusable",
        "Excessive noise from construction site outside permitted hours"
      ]
    };
    
    const descriptionOptions = descriptions[type] || descriptions.other;
    const description = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
    
    // Get a relevant image based on report type
    const imageIndex = reportTypes.indexOf(type) % mockImages.length;
    const images = [mockImages[imageIndex]];
    
    // Generate fake AI analysis
    const aiAnalysis = {
      suggestedType: type,
      suggestedPriority: adjustedPriority,
      confidence: 0.7 + Math.random() * 0.3, // Between 0.7 and 1.0
      description: `AI detected a ${type.replace('_', ' ')} issue with ${adjustedPriority} priority.`
    };
    
    reports.push({
      id: `report-${i}`,
      type,
      description,
      location: {
        lat,
        lng,
        address: `${Math.floor(Math.random() * 1000)} Main St, New York, NY`
      },
      images,
      priority: adjustedPriority,
      status,
      createdAt,
      updatedAt,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      aiAnalysis,
      emergency: isEmergency
    });
  }
  
  return reports;
};

// Generate 25 mock reports
export const mockReports = generateMockReports(25);

// Function to get a single report by ID
export const getMockReportById = (id: string): Report | undefined => {
  return mockReports.find(report => report.id === id);
};

// Function to get filtered reports
export const getFilteredReports = (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Report[] => {
  return mockReports.filter(report => {
    if (status && report.status !== status) return false;
    if (priority && report.priority !== priority) return false;
    if (type && report.type !== type) return false;
    return true;
  });
};
