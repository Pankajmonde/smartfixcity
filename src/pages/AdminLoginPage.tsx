
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import NavBar from '@/components/NavBar';

// In a real app, you'd use a proper authentication system
// This is a simplified example for demonstration purposes
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'cityfix123';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store admin auth in localStorage
        localStorage.setItem('isAdminAuthenticated', 'true');
        toast.success('Login successful');
        navigate('/admin');
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Default credentials: admin / cityfix123</span>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AdminLoginPage;
