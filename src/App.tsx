import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { SidebarNavigation } from './components/sidebar-navigation';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Search, Bell, Menu } from 'lucide-react';
import { getUserProgress, healthCheck } from './utils/api';
import type { UserProgress } from './utils/api';

const Dashboard = lazy(() => import('./components/dashboard').then(m => ({ default: m.Dashboard })));
const UploadPage = lazy(() => import('./components/upload-page').then(m => ({ default: m.UploadPage })));
const SummaryView = lazy(() => import('./components/summary-view').then(m => ({ default: m.SummaryView })));
const Flashcards = lazy(() => import('./components/flashcards').then(m => ({ default: m.Flashcards })));
const Settings = lazy(() => import('./components/settings').then(m => ({ default: m.Settings })));

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize backend connection and user data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [, progressResponse] = await Promise.all([
          healthCheck(),
          getUserProgress('default')
        ]);
        setIsBackendReady(true);
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
    setIsSidebarOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate search functionality
    console.log('Searching for:', searchQuery);
  };

  const updateUserProgress = (newProgress: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...newProgress }));
  };

  const commonProps = useMemo(() => ({
    onPageChange: handlePageChange,
    userProgress,
    updateUserProgress,
    isBackendReady
  }), [userProgress, isBackendReady]);

  const renderCurrentPage = () => {
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
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        isBackendReady={isBackendReady}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0 w-full">
        {/* Top Navigation Bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10" aria-label="Top navigation bar">
          <div className="flex items-center justify-between p-4">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

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
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-[--neon-green] rounded-full"></span>
                <span className="sr-only">You have new notifications</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-auto">
          <Suspense fallback={<div>Loading...</div>}>
            {renderCurrentPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
