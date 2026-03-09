import { Highlighter, CheckCircle, Settings, Bookmark } from "lucide-react";

interface ArticleToolbarProps {
  showHighlights: boolean;
  onToggleHighlights: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  readStatus: 'unread' | 'in_progress' | 'read';
  onMarkAsRead: () => void;
  onSettings?: () => void;
}

export function ArticleToolbar({
  showHighlights,
  onToggleHighlights,
  isBookmarked,
  onBookmark,
  readStatus,
  onMarkAsRead,
  onSettings
}: ArticleToolbarProps) {
  return (
    <div className="mb-10 flex items-center gap-6 border-b border-border pb-4">
      <button 
        onClick={onToggleHighlights}
        className={`flex items-center gap-2 text-[15px] font-medium transition-colors ${
          showHighlights ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Highlighter className="h-[18px] w-[18px]" />
        {showHighlights ? 'Hide Highlights' : 'Show Highlights'}
      </button>
      
      <button 
        onClick={onBookmark}
        className={`flex items-center gap-2 text-[15px] font-medium transition-colors ${
          isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className={`h-[18px] w-[18px] ${isBookmarked ? 'fill-primary' : ''}`} />
        {isBookmarked ? 'Bookmarked' : 'Bookmark Article'}
      </button>
      
      <button 
        onClick={onMarkAsRead}
        className={`flex items-center gap-2 text-[15px] font-medium transition-colors ${
          readStatus === 'read' 
            ? 'text-green-600' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <CheckCircle className={`h-[18px] w-[18px] ${readStatus === 'read' ? 'fill-green-600' : ''}`} />
        {readStatus === 'read' ? 'Marked as Read' : 'Mark as Read'}
      </button>
      
      {onSettings && (
        <button 
          onClick={onSettings}
          className="ml-auto flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
}