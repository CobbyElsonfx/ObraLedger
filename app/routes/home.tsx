import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import Dashboard from "./_index";
import DeceasedPage from "./deceased";
import ContributorsPage from "./contributors";
import ContributionsPage from "./contributions";
import ExpensesPage from "./expenses";
import ReportsPage from "./reports";
import SettingsPage from "./settings";
import LoginPage from "./login";
import { authService } from "../../lib/auth";
import { syncService } from "../../lib/syncService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Obra Ledger - Funeral Management System" },
    { name: "description", content: "Offline-first funeral management system for community organizations" },
  ];
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        // Wait for auth service to initialize
        await authService.initialize();
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        // Initialize sync service if authenticated
        if (authenticated) {
          // Start auto sync every 5 minutes
          syncService.startAutoSync(5);
          
          // Try initial sync
          try {
            await syncService.manualSync();
          } catch (error) {
            console.log('Initial sync failed (this is normal if backend is not running):', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((user) => {
      console.log('Auth state changed:', !!user);
      setIsAuthenticated(!!user);
      
      // Start/stop sync based on authentication
      if (user) {
        syncService.startAutoSync(5);
      } else {
        syncService.stopAutoSync();
      }
    });

    return () => {
      unsubscribe();
      syncService.stopAutoSync();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const forceAuthCheck = () => {
    const authenticated = authService.isAuthenticated();
    console.log('Force auth check result:', authenticated);
    setIsAuthenticated(authenticated);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'deceased':
        return <DeceasedPage />;
      case 'contributors':
        return <ContributorsPage />;
      case 'contributions':
        return <ContributionsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main application if authenticated
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
