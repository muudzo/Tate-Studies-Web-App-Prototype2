import { useState, useEffect } from 'react';
import { SidebarNavigation } from './components/sidebar-navigation';
import { Dashboard } from './components/dashboard';
import { UploadPage } from './components/upload-page';
import { SummaryView } from './components/summary-view';
import { Flashcards } from './components/flashcards';
import { Settings } from './components/settings';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Search, Bell } from 'lucide-react';
import { getUserProgress, healthCheck } from './utils/api';
import type { UserProgress } from './utils/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: 'default',
    xp: 0,
    streak: 0,
    achievements: [],
    lastUpdated: new Date().toISOString()
  });
  const [isBackendReady, setIsBackendReady] = useState(false);

  // Initialize backend connection and user data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check backend health
        await healthCheck();
        setIsBackendReady(true);
        
        // Load user progress
        const progressResponse = await getUserProgress('default');
        if (progressResponse.success) {
          setUserProgress(progressResponse.progress);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // App will continue to work with mock data
        setIsBackendReady(false);
      }
    };

    initializeApp();
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate search functionality
    console.log('Searching for:', searchQuery);
  };

  const updateUserProgress = (newProgress: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...newProgress }));
  };

  const renderCurrentPage = () => {
    const commonProps = {
      onPageChange: handlePageChange,
      userProgress,
      updateUserProgress,
      isBackendReady
    };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'upload':
        return <UploadPage {...commonProps} />;
      case 'summaries':
        return <SummaryView {...commonProps} />;
      case 'flashcards':
        return <Flashcards {...commonProps} />;
      case 'settings':
        return <Settings 
          isDarkMode={isDarkMode} 
          onThemeToggle={handleThemeToggle}
          {...commonProps}
        />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        isBackendReady={isBackendReady}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search your notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-[--neon-blue]/50"
                />
              </form>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-accent/50"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-[--neon-green] rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}