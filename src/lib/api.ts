
import { ref, set, push, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from './firebase';
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
const checkForDuplicateReports = async (
  newReport: ReportFormData
): Promise<Report | null> => {
  // Default threshold is 50 meters
  const DUPLICATE_THRESHOLD_METERS = 50;
  
  // Get all reports
  const reportsRef = ref(database, 'reports');
  const snapshot = await get(reportsRef);
  
  if (!snapshot.exists()) return null;
  
  const reports: Report[] = Object.values(snapshot.val());
  
  for (const report of reports) {
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

// Fetch all reports from Firebase
export const fetchReports = async (): Promise<Report[]> => {
  await delay(800); // Simulate network delay
  
  const reportsRef = ref(database, 'reports');
  const snapshot = await get(reportsRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  // Convert Firebase object to array of reports
  const reports: Report[] = [];
  snapshot.forEach((childSnapshot) => {
    reports.push({ id: childSnapshot.key, ...childSnapshot.val() } as Report);
  });
  
  return reports;
};

export const fetchReportById = async (id: string): Promise<Report | null> => {
  await delay(500);
  
  const reportRef = ref(database, `reports/${id}`);
  const snapshot = await get(reportRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return { id: snapshot.key, ...snapshot.val() } as Report;
};

export const fetchFilteredReports = async (
  status?: ReportStatus,
  priority?: PriorityLevel,
  type?: ReportType
): Promise<Report[]> => {
  await delay(800);
  
  const reports = await fetchReports();
  
  return reports.filter(report => {
    if (status && report.status !== status) return false;
    if (priority && report.priority !== priority) return false;
    if (type && report.type !== type) return false;
    return true;
  });
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

// Upload image to Firebase Storage and get download URL
const uploadImage = async (image: File, reportId: string, index: number): Promise<string> => {
  const fileRef = storageRef(storage, `reports/${reportId}/image_${index}`);
  await uploadBytes(fileRef, image);
  return getDownloadURL(fileRef);
};

// Submit a new report to Firebase
export const submitReport = async (reportData: ReportFormData): Promise<Report> => {
  await delay(1000); // Simulate network delay
  
  // Check for duplicate reports
  const duplicateReport = await checkForDuplicateReports(reportData);
  if (duplicateReport) {
    throw new Error(`DUPLICATE:${duplicateReport.id}`);
  }
  
  // Create a new report reference with a unique ID
  const reportsRef = ref(database, 'reports');
  const newReportRef = push(reportsRef);
  const reportId = newReportRef.key as string;
  
  // Upload images to Firebase Storage
  const imageUrls: string[] = [];
  for (let i = 0; i < reportData.images.length; i++) {
    const imageUrl = await uploadImage(reportData.images[i], reportId, i);
    imageUrls.push(imageUrl);
  }
  
  // Create the report object
  const newReport: Report = {
    id: reportId,
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
  
  // Save report to Firebase
  await set(newReportRef, newReport);
  
  return newReport;
};

// Update report status in Firebase
export const updateReportStatus = async (
  reportId: string, 
  status: ReportStatus
): Promise<Report> => {
  await delay(800);
  
  const reportRef = ref(database, `reports/${reportId}`);
  const snapshot = await get(reportRef);
  
  if (!snapshot.exists()) {
    throw new Error(`Report with ID ${reportId} not found`);
  }
  
  const report = { id: reportId, ...snapshot.val() } as Report;
  const updatedReport = {
    ...report,
    status,
    updatedAt: new Date().toISOString()
  };
  
  // Update only the required fields
  await update(reportRef, {
    status,
    updatedAt: updatedReport.updatedAt
  });
  
  return updatedReport;
};

// Delete a report from Firebase
export const deleteReport = async (reportId: string): Promise<void> => {
  await delay(500);
  
  const reportRef = ref(database, `reports/${reportId}`);
  const snapshot = await get(reportRef);
  
  if (!snapshot.exists()) {
    throw new Error(`Report with ID ${reportId} not found`);
  }
  
  // Only allow deleting reports with 'pending' status
  const report = snapshot.val() as Report;
  if (report.status !== 'pending') {
    throw new Error(`Only pending reports can be deleted`);
  }
  
  // Delete the report
  await remove(reportRef);
};
