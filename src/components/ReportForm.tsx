
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ReportFormData, ReportType } from '../types';
import ImageUpload from './ImageUpload';
import LocationPicker from './LocationPicker';
import { analyzeImage } from '../lib/api';
import { toast } from 'sonner';

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => Promise<void>;
  isSubmitting: boolean;
  isEmergency?: boolean;
}

const ReportForm = ({ onSubmit, isSubmitting, isEmergency = false }: ReportFormProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError, clearErrors } = useForm<ReportFormData>({
    defaultValues: {
      type: isEmergency ? 'emergency' : 'pothole',
      description: '',
      location: {
        lat: 0,
        lng: 0,
      },
      images: [],
      emergency: isEmergency,
    },
  });

  const reportType = watch('type');
  
  // Set emergency value when the isEmergency prop changes
  useEffect(() => {
    setValue('emergency', isEmergency);
    if (isEmergency) {
      setValue('type', 'emergency');
    }
  }, [isEmergency, setValue]);

  const handleImagesSelected = async (files: File[]) => {
    setSelectedImages(files);
    setValue('images', files);
    
    if (files.length === 0) {
      setError('images', {
        type: 'required',
        message: 'At least one photo is required'
      });
    } else {
      clearErrors('images');
      
      // If at least one image is selected, run AI analysis
      if (files.length > 0 && !isEmergency) {
        setIsAnalyzing(true);
        setAiSuggestion(null);
        
        try {
          const analysis = await analyzeImage(files[0]);
          
          // If type is not already set to emergency, update it based on analysis
          if (reportType !== 'emergency') {
            setValue('type', analysis.suggestedType);
          }
          
          setAiSuggestion(
            `AI suggests this is a ${analysis.suggestedType.replace('_', ' ')} issue with ${analysis.suggestedPriority} priority. ${analysis.description}`
          );
        } catch (error) {
          console.error('Error analyzing image:', error);
          toast.error('Failed to analyze image');
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const handleLocationSelected = (location: { lat: number; lng: number; address?: string }) => {
    setValue('location', location);
    
    // Check if this is a valid location (not the default)
    const isValidLocation = location.lat !== 0 && location.lng !== L;
    setLocationSelected(isValidLocation);
    
    if (!isValidLocation) {
      setError('location', {
        type: 'required',
        message: 'Please select a location on the map'
      });
    } else {
      clearErrors('location');
    }
  };

  const handleFormSubmit = (data: ReportFormData) => {
    let hasError = false;
    
    // Validate images (required field)
    if (selectedImages.length === 0) {
      setError('images', {
        type: 'required',
        message: 'At least one photo is required'
      });
      hasError = true;
      toast.error('Please upload at least one photo');
    }
    
    // Validate location (required field)
    if (!locationSelected || (data.location.lat === 0 && data.location.lng === 0)) {
      setError('location', {
        type: 'required',
        message: 'Please select a location on the map'
      });
      hasError = true;
      toast.error('Please select a location on the map');
    }
    
    if (hasError) {
      return;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {isEmergency && (
        <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Emergency Report</h3>
            <p className="text-sm text-red-700">
              Your report will be flagged as high priority and sent immediately to response teams.
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Issue Type</Label>
          <Select 
            defaultValue={reportType} 
            onValueChange={(value) => setValue('type', value as ReportType)}
            disabled={isEmergency} // Disable if it's an emergency
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              {isEmergency ? (
                <SelectItem value="emergency">Emergency</SelectItem>
              ) : (
                <>
                  <SelectItem value="pothole">Pothole</SelectItem>
                  <SelectItem value="water_leak">Water Leak</SelectItem>
                  <SelectItem value="street_light">Street Light</SelectItem>
                  <SelectItem value="graffiti">Graffiti</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                  <SelectItem value="sidewalk">Sidewalk Issue</SelectItem>
                  <SelectItem value="traffic_light">Traffic Light</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            placeholder="Describe the issue in detail..."
            className="min-h-[100px]"
            {...register('description', { 
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Description must be at least 10 characters'
              }
            })}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div>
          <Label>Upload Photos <span className="text-red-500">*</span></Label>
          <ImageUpload 
            onImagesSelected={handleImagesSelected}
            maxImages={3}
            existingImages={selectedImages}
          />
          {errors.images && (
            <p className="text-sm text-red-500 mt-1">{errors.images.message}</p>
          )}
          
          {isAnalyzing && (
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing image with AI...
            </div>
          )}
          
          {aiSuggestion && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
              {aiSuggestion}
            </div>
          )}
        </div>
        
        <div>
          <Label>Location <span className="text-red-500">*</span></Label>
          <LocationPicker 
            onLocationSelected={handleLocationSelected} 
            required={true}
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || isAnalyzing}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          `Submit ${isEmergency ? 'Emergency ' : ''}Report`
        )}
      </Button>
    </form>
  );
};

export default ReportForm;
