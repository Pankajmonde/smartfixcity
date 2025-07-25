
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
      setIsAdmin(isAuthenticated);
      setIsLoading(false);
      
      // Only redirect to admin login if trying to access admin route
      if (!isAuthenticated && window.location.pathname === '/admin') {
        navigate('/admin-login');
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAdmin(false);
    navigate('/admin-login');
  };

  return { isAdmin, isLoading, logout };
};
