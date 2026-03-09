import { Link } from "react-router-dom";
import { Menu, Maximize, Minimize, Sun, Moon, Eye, EyeOff, Home, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface LibraryHeaderProps {
  onFullscreen?: () => void;
  onThemeToggle?: () => void;
  showHighlights?: boolean;
  onToggleHighlights?: () => void;
}

export function LibraryHeader({ 
  onFullscreen, 
  onThemeToggle,
  showHighlights = true,
  onToggleHighlights 
}: LibraryHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    onThemeToggle?.();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Medical Library</h1>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={onFullscreen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="h-[18px] w-[18px]" />
          ) : (
            <Maximize className="h-[18px] w-[18px]" />
          )}
        </button>
        
        <button 
          onClick={handleThemeToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>
        
        <button 
          onClick={onToggleHighlights}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
            showHighlights 
              ? 'text-primary hover:bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
          title={showHighlights ? "Hide Highlights" : "Show Highlights"}
        >
          {showHighlights ? (
            <Eye className="h-[18px] w-[18px]" />
          ) : (
            <EyeOff className="h-[18px] w-[18px]" />
          )}
        </button>

        <button 
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Home className="h-[18px] w-[18px]" />
          <span className="text-sm font-medium">Home</span>
        </Link>
      </div>
    </header>
  );
}
