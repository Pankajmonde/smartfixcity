
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sheet, SheetContent, SheetTrigger, SheetClose 
} from '@/components/ui/sheet';
import { Menu, Home, Map, PlusCircle, LayoutDashboard, AlertTriangle } from 'lucide-react';

interface NavBarProps {
  onEmergencyClick?: () => void;
}

const NavBar = ({ onEmergencyClick }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <SheetClose asChild>
                  <Link to="/" className="flex items-center gap-2 py-2">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/map" className="flex items-center gap-2 py-2">
                    <Map className="h-5 w-5" />
                    <span>Map View</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 py-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/report" className="flex items-center gap-2 py-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Report Issue</span>
                  </Link>
                </SheetClose>
                
                {onEmergencyClick && (
                  <SheetClose asChild>
                    <Button 
                      variant="destructive" 
                      className="mt-4 flex items-center gap-2"
                      onClick={onEmergencyClick}
                    >
                      <AlertTriangle className="h-5 w-5" />
                      <span>Report Emergency</span>
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-city-primary">CityReport</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-city-primary transition-colors">
            Home
          </Link>
          <Link to="/map" className="text-sm font-medium hover:text-city-primary transition-colors">
            Map View
          </Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-city-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/report" className="text-sm font-medium hover:text-city-primary transition-colors">
            Report Issue
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {onEmergencyClick && (
            <Button 
              variant="destructive" 
              size="sm"
              className="hidden md:flex items-center gap-2"
              onClick={onEmergencyClick}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Emergency</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
