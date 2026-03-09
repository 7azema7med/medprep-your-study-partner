import { StickyNote, Zap, MessageCircle, Bookmark as BookmarkIcon, Image as ImageIcon } from "lucide-react";

interface UtilityBarProps {
  onNotes?: () => void;
  onQuickAction?: () => void;
  onComments?: () => void;
  onBookmarks?: () => void;
  onAttachments?: () => void;
}

export function UtilityBar({
  onNotes,
  onQuickAction,
  onComments,
  onBookmarks,
  onAttachments
}: UtilityBarProps) {
  return (
    <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-8 rounded-full border border-border bg-background px-8 py-3 shadow-sm">
      <button 
        onClick={onNotes}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Notes"
      >
        <StickyNote className="h-[22px] w-[22px] stroke-[1.5]" />
      </button>
      
      <button 
        onClick={onQuickAction}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Quick Actions"
      >
        <Zap className="h-[22px] w-[22px] stroke-[1.5]" />
      </button>
      
      <button 
        onClick={onComments}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Comments"
      >
        <MessageCircle className="h-[22px] w-[22px] stroke-[1.5]" />
      </button>
      
      <button 
        onClick={onBookmarks}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Bookmarks"
      >
        <BookmarkIcon className="h-[22px] w-[22px] stroke-[1.5]" />
      </button>
      
      <button 
        onClick={onAttachments}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Attachments"
      >
        <ImageIcon className="h-[22px] w-[22px] stroke-[1.5]" />
      </button>
    </div>
  );
}