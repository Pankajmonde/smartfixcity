
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  className?: string;
  existingImages?: File[];
  previewUrls?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelected,
  maxImages = 3,
  className = '',
  existingImages = [],
  previewUrls = []
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>(existingImages);
  const [previews, setPreviews] = useState<string[]>(previewUrls);

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    onImagesSelected(newImages);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const takePicture = async () => {
    try {
      // Check if the mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media Devices API not supported in this browser.');
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a video element to display the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Wait for the video to load metadata
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Convert the canvas to a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else resolve(new Blob([]));
        }, 'image/jpeg', 0.9);
      });
      
      // Create a file from the blob
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Add the new file to our selected images
      const newFiles = [...selectedImages, file].slice(0, maxImages);
      setSelectedImages(newFiles);
      onImagesSelected(newFiles);
      
      // Generate a preview URL for the new image
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviews([...previews, newPreviewUrl].slice(0, maxImages));
      
      // Stop all tracks in the stream to turn off the camera
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mb-3">
        {previews.map((previewUrl, index) => (
          <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
            <img 
              src={previewUrl} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
              onClick={() => handleRemoveImage(index)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {selectedImages.length < maxImages && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="w-24 h-24 border-dashed flex flex-col items-center justify-center gap-1"
            onClick={takePicture}
          >
            <Camera size={20} />
            <span className="text-xs">Camera</span>
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {selectedImages.length === 0 
          ? 'Take photos of the issue (max 3 images)' 
          : `${selectedImages.length} of ${maxImages} images selected`}
      </p>
    </div>
  );
};

export default ImageUpload;
