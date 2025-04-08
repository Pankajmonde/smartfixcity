
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and update city infrastructure reports
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-md border border-amber-200">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
