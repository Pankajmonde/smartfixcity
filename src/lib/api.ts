import { Report, ReportFormData, PriorityLevel, ReportType, ReportStatus } from '../types';
import { reportsCollection } from './mongodb';

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
const checkForDuplicateReports = async (
  newReport: ReportFormData
): Promise<Report | null> => {
  // Default threshold is 50 meters
  const DUPLICATE_THRESHOLD_METERS = 50;
  
  try {
    // Get all reports
    const reports = await reportsCollection.find({
      status: { $ne: 'resolved' },
      type: newReport.type
    }) as unknown as Report[];
    
    for (const report of reports) {
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
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return null;
  }
};

// Fetch all reports from MongoDB
export const fetchReports = async (): Promise<Report[]> => {
  await delay(500); // Simulate network delay
  
  try {
    const reportDocs = await reportsCollection.find();
    
    // Convert document format to Report objects
    const reports: Report[] = reportDocs.map(doc => ({
      id: doc._id.toString(),
      type: doc.type,
      description: doc.description,
      location: doc.location,
      images: doc.images,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userId: doc.userId,
      emergency: doc.emergency,
      aiAnalysis: doc.aiAnalysis
    }));
    
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const fetchReportById = async (id: string): Promise<Report | null> => {
  await delay(300);
  
  try {
    const doc = await reportsCollection.findOne({ _id: id });
    
    if (!doc) {
      return null;
    }
    
    // Convert document to Report object
    return {
      id: doc._id.toString(),
      type: doc.type,
      description: doc.description,
      location: doc.location,
      images: doc.images,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userId: doc.userId,
      emergency: doc.emergency,
      aiAnalysis: doc.aiAnalysis
    };
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    return null;
  }
};

export const fetchFilteredReports = async (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Promise<Report[]> => {
  await delay(500);
  
  try {
    // Build the filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    
    const reportDocs = await reportsCollection.find(filter);
    
    // Convert document format to Report objects
    const reports: Report[] = reportDocs.map(doc => ({
      id: doc._id.toString(),
      type: doc.type,
      description: doc.description,
      location: doc.location,
      images: doc.images,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userId: doc.userId,
      emergency: doc.emergency,
      aiAnalysis: doc.aiAnalysis
    }));
    
    return reports;
  } catch (error) {
    console.error('Error fetching filtered reports:', error);
    return [];
  }
};

// Simulate AI analysis of images
export const analyzeImage = async (image: File): Promise<{
  suggestedType: ReportType;
  suggestedPriority: PriorityLevel;
  confidence: number;
  description: string;
}> => {
  await delay(1000); // Simulate AI processing time
  
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

// Upload image function (this would typically upload to a cloud storage service)
const uploadImage = async (image: File): Promise<string> => {
  await delay(1000); // Simulate upload time
  
  // For demo purposes, we're just returning a URL to a local image
  // In a real app, we would upload to cloud storage and get a URL
  const dummyImageUrls: Record<string, string> = {
    'pothole': '/images/pothole.jpg',
    'water': '/images/water-leak.jpg',
    'leak': '/images/water-leak.jpg',
    'light': '/images/street-light.jpg',
    'graffiti': '/images/graffiti.jpg',
    'trash': '/images/trash.jpg',
    'sidewalk': '/images/sidewalk.jpg',
    'traffic': '/images/traffic-light.jpg',
    'emergency': '/images/emergency.jpg'
  };
  
  // Find a matching image URL based on the filename
  const filename = image.name.toLowerCase();
  for (const [key, url] of Object.entries(dummyImageUrls)) {
    if (filename.includes(key)) {
      return url;
    }
  }
  
  // Default image if no match found
  return '/images/pothole.jpg';
};

// Submit a new report to MongoDB
export const submitReport = async (reportData: ReportFormData): Promise<Report> => {
  await delay(800); // Simulate network delay
  
  // Check for duplicate reports
  const duplicateReport = await checkForDuplicateReports(reportData);
  if (duplicateReport) {
    throw new Error(`DUPLICATE:${duplicateReport.id}`);
  }
  
  // Upload images
  const imageUrls: string[] = [];
  for (let i = 0; i < reportData.images.length; i++) {
    const imageUrl = await uploadImage(reportData.images[i]);
    imageUrls.push(imageUrl);
  }
  
  // Create the report object
  const newReport = {
    type: reportData.type,
    description: reportData.description,
    location: reportData.location,
    images: imageUrls,
    priority: reportData.emergency ? 'high' : 'medium', // Default to medium unless emergency
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emergency: reportData.emergency,
    userId: 'current-user',
    aiAnalysis: {
      suggestedType: reportData.type,
      suggestedPriority: reportData.emergency ? 'high' : 'medium',
      confidence: 0.9,
      description: `AI detected a ${reportData.type.replace('_', ' ')} issue.`
    }
  };
  
  try {
    // Insert the report
    const result = await reportsCollection.insertOne(newReport);
    
    // Return the new report with the generated ID
    return {
      ...newReport,
      id: result.insertedId.toString(),
    } as Report;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

// Update report status
export const updateReportStatus = async (
  reportId: string, 
  status: ReportStatus
): Promise<Report> => {
  await delay(500);
  
  try {
    const result = await reportsCollection.findOneAndUpdate(
      { _id: reportId },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error(`Report with ID ${reportId} not found`);
    }
    
    // Convert document to Report object
    return {
      id: result._id.toString(),
      type: result.type,
      description: result.description,
      location: result.location,
      images: result.images,
      priority: result.priority,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      userId: result.userId,
      emergency: result.emergency,
      aiAnalysis: result.aiAnalysis
    };
  } catch (error) {
    console.error('Error updating report status:', error);
    throw new Error('Failed to update report status');
  }
};

// Delete a report
export const deleteReport = async (reportId: string): Promise<void> => {
  await delay(300);
  
  try {
    // Find the report to check its status
    const report = await reportsCollection.findOne({ _id: reportId });
    
    if (!report) {
      throw new Error(`Report with ID ${reportId} not found`);
    }
    
    // Only allow deleting reports with 'pending' status
    if (report.status !== 'pending') {
      throw new Error(`Only pending reports can be deleted`);
    }
    
    // Delete the report
    await reportsCollection.deleteOne({ _id: reportId });
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report');
  }
};

// Add sample data to the database
export const addSampleReports = async (): Promise<void> => {
  // Check if we already have reports
  const count = await reportsCollection.countDocuments();
  if (count > 0) {
    console.log('Sample data already exists');
    return;
  }
  
  // Sample reports for India
  const sampleReports = [
    {
      type: 'pothole',
      description: 'Large pothole on the road near Connaught Place causing traffic delays.',
      location: {
        lat: 28.6304,
        lng: 77.2177,
        address: 'Connaught Place, New Delhi, Delhi 110001'
      },
      images: ['/images/pothole.jpg'],
      priority: 'high',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-delhi-1',
      emergency: false,
      aiAnalysis: {
        suggestedType: 'pothole',
        suggestedPriority: 'high',
        confidence: 0.95,
        description: 'AI detected a pothole issue with high priority.'
      }
    },
    {
      type: 'water_leak',
      description: 'Water pipe leakage at Bandra resulting in water wastage and road damage.',
      location: {
        lat: 19.0596,
        lng: 72.8295,
        address: 'Bandra West, Mumbai, Maharashtra 400050'
      },
      images: ['/images/water-leak.jpg'],
      priority: 'medium',
      status: 'investigating',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      userId: 'user-mumbai-1',
      emergency: false,
      aiAnalysis: {
        suggestedType: 'water_leak',
        suggestedPriority: 'medium',
        confidence: 0.88,
        description: 'AI detected a water leak issue with medium priority.'
      }
    },
    {
      type: 'street_light',
      description: 'Street light not working at Koramangala causing safety concerns for residents.',
      location: {
        lat: 12.9352,
        lng: 77.6245,
        address: 'Koramangala, Bengaluru, Karnataka 560034'
      },
      images: ['/images/street-light.jpg'],
      priority: 'low',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-bengaluru-1',
      emergency: false,
      aiAnalysis: {
        suggestedType: 'street_light',
        suggestedPriority: 'low',
        confidence: 0.92,
        description: 'AI detected a street light issue with low priority.'
      }
    },
    {
      type: 'trash',
      description: 'Overflowing garbage bins at Marine Drive creating unsanitary conditions.',
      location: {
        lat: 18.9438,
        lng: 72.8231,
        address: 'Marine Drive, Mumbai, Maharashtra 400020'
      },
      images: ['/images/trash.jpg'],
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-mumbai-2',
      emergency: false,
      aiAnalysis: {
        suggestedType: 'trash',
        suggestedPriority: 'medium',
        confidence: 0.85,
        description: 'AI detected a trash issue with medium priority.'
      }
    },
    {
      type: 'traffic_light',
      description: 'Malfunctioning traffic signal at India Gate junction causing traffic congestion.',
      location: {
        lat: 28.6129,
        lng: 77.2295,
        address: 'India Gate, New Delhi, Delhi 110001'
      },
      images: ['/images/traffic-light.jpg'],
      priority: 'high',
      status: 'investigating',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-delhi-2',
      emergency: true,
      aiAnalysis: {
        suggestedType: 'traffic_light',
        suggestedPriority: 'high',
        confidence: 0.91,
        description: 'AI detected a traffic light issue with high priority.'
      }
    }
  ];
  
  try {
    await reportsCollection.insertMany(sampleReports);
    console.log('Sample reports added to database');
  } catch (error) {
    console.error('Error adding sample reports:', error);
  }
};

// Initialize sample data
addSampleReports();
