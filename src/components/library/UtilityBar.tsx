import { StickyNote, Zap, MessageCircle, Bookmark as BookmarkIcon, Search, Image as ImageIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UtilityBarProps {
  onNotes?: () => void;
  onQuickAction?: () => void;
  onComments?: () => void;
  onBookmarks?: () => void;
  onSearch?: () => void;
  onAttachments?: () => void;
}

export function UtilityBar({
  onNotes,
  onQuickAction,
  onComments,
  onBookmarks,
  onSearch,
  onAttachments
}: UtilityBarProps) {
  const buttons = [
    { icon: StickyNote, label: "Notes", onClick: onNotes },
    { icon: Zap, label: "Quick Actions", onClick: onQuickAction },
    { icon: MessageCircle, label: "Comments", onClick: onComments },
    { icon: BookmarkIcon, label: "Bookmarks", onClick: onBookmarks },
    { icon: Search, label: "Search Article", onClick: onSearch },
    { icon: ImageIcon, label: "Attachments", onClick: onAttachments },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 backdrop-blur-sm px-3 py-2 shadow-lg">
        {buttons.map((button, index) => (
          <Tooltip key={button.label}>
            <TooltipTrigger asChild>
              <button 
                onClick={button.onClick}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <button.icon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {button.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
