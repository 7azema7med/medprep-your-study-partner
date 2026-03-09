import { Link } from "react-router-dom";
import { Menu, Maximize, Sun, Moon, Eye, Home } from "lucide-react";

interface LibraryHeaderProps {
  onFullscreen?: () => void;
  onThemeToggle?: () => void;
}

export function LibraryHeader({ onFullscreen, onThemeToggle }: LibraryHeaderProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-[22px] font-medium text-foreground">Medical Library</h1>
      </div>
      <div className="flex items-center gap-6 text-muted-foreground">
        <button 
          onClick={onFullscreen}
          className="hover:text-foreground transition-colors"
        >
          <Maximize className="h-5 w-5 stroke-[1.5]" />
        </button>
        <button 
          onClick={onThemeToggle}
          className="hover:text-foreground transition-colors"
        >
          <Sun className="h-5 w-5 stroke-[1.5]" />
        </button>
        <button 
          onClick={onThemeToggle}
          className="hover:text-foreground transition-colors"
        >
          <Moon className="h-5 w-5 stroke-[1.5]" />
        </button>
        <button className="hover:text-foreground transition-colors">
          <Eye className="h-5 w-5 stroke-[1.5]" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
          <Home className="h-5 w-5 stroke-[1.5]" />
          <span className="text-[15px] font-medium">Home</span>
        </Link>
      </div>
    </header>
  );
}