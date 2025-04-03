
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface EmergencyButtonProps {
  onClick: () => void;
  className?: string;
}

const EmergencyButton = ({ onClick, className = '' }: EmergencyButtonProps) => {
  return (
    <Button
      variant="destructive"
      className={`flex items-center gap-2 py-6 animate-pulse-emergency ${className}`}
      onClick={onClick}
    >
      <AlertTriangle className="h-5 w-5" />
      <span className="font-bold">Report Emergency</span>
    </Button>
  );
};

export default EmergencyButton;
