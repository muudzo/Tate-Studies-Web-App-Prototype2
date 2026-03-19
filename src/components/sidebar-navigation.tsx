import { Home, Upload, Sparkles, Gamepad2, Settings, Sun, Moon, BookOpen, Lightbulb, Wifi, WifiOff, X } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

interface SidebarNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  isBackendReady?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SidebarNavigation({ currentPage, onPageChange, isDarkMode, onThemeToggle, isBackendReady = false, isOpen = false, onToggle }: SidebarNavigationProps) {
  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'summaries', icon: Sparkles, label: 'Summaries' },
    { id: 'flashcards', icon: Gamepad2, label: 'Flashcards' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-[--neon-blue]" />
              <Lightbulb className="h-4 w-4 text-[--neon-green] absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Tate Studies</h1>
              <p className="text-xs text-muted-foreground">Bullshitting Through School</p>
            </div>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 rounded-xl transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-[--neon-blue]/20 to-[--neon-purple]/20 border border-[--neon-blue]/30 neon-glow'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <item.icon className={`h-5 w-5 ${currentPage === item.id ? 'text-[--neon-blue]' : ''}`} />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Connection Status & Theme Toggle */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Backend Connection Status */}
          <div className="flex items-center gap-2 text-xs">
            {isBackendReady ? (
              <>
                <Wifi className="h-3 w-3 text-[hsl(var(--neon-green-text))]" />
                <span className="text-[hsl(var(--neon-green-text))]">AI Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Demo Mode</span>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm">Theme</span>
              <Moon className="h-4 w-4" />
            </div>
            <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
          </div>
        </div>
      </div>
    </>
  );
}
