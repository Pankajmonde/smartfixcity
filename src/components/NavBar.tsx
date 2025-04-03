
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AlertTriangle, Menu, Map, LayoutDashboard, Plus, ShieldAlert } from 'lucide-react';
import EmergencyButton from './EmergencyButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavBarProps {
  onEmergencyClick?: () => void;
}

const NavBar = ({ onEmergencyClick }: NavBarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = () => {
      const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
      setIsAdmin(isAuthenticated);
    };

    checkAdmin();
    
    // Listen for storage events to update admin status
    window.addEventListener('storage', checkAdmin);
    
    return () => {
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block">CityFix</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/dashboard">
            <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size="sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/map">
            <Button variant={isActive('/map') ? 'secondary' : 'ghost'} size="sm">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </Link>
          <Link to="/report">
            <Button variant={isActive('/report') ? 'secondary' : 'ghost'} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} size="sm">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
          {!isAdmin && (
            <Link to="/admin-login">
              <Button variant={isActive('/admin-login') ? 'secondary' : 'ghost'} size="sm">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex justify-end items-center gap-2">
            {onEmergencyClick && (
              <div className="hidden md:block">
                <EmergencyButton onClick={onEmergencyClick} />
              </div>
            )}
            
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="px-2 py-6 flex flex-col gap-4">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} className="w-full justify-start">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/map" onClick={() => setIsOpen(false)}>
                      <Button variant={isActive('/map') ? 'secondary' : 'ghost'} className="w-full justify-start">
                        <Map className="h-4 w-4 mr-2" />
                        Map View
                      </Button>
                    </Link>
                    <Link to="/report" onClick={() => setIsOpen(false)}>
                      <Button variant={isActive('/report') ? 'secondary' : 'ghost'} className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Report Issue
                      </Button>
                    </Link>
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} className="w-full justify-start">
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/admin-login" onClick={() => setIsOpen(false)}>
                        <Button variant={isActive('/admin-login') ? 'secondary' : 'ghost'} className="w-full justify-start">
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Admin Login
                        </Button>
                      </Link>
                    )}
                    
                    {onEmergencyClick && (
                      <Button 
                        variant="destructive" 
                        className="mt-4 w-full"
                        onClick={() => {
                          setIsOpen(false);
                          onEmergencyClick();
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergency
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
