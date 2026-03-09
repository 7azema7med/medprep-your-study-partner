import { useState, useRef, useCallback } from "react";
import { UserHighlight } from "@/hooks/useMedicalLibrary";
import { Highlighter, MessageSquare, Bookmark } from "lucide-react";

interface HighlightMenuProps {
  onHighlight: (color: string) => void;
  onNote: () => void;
  onBookmark: () => void;
  position: { x: number; y: number };
}

const HighlightMenu = ({ onHighlight, onNote, onBookmark, position }: HighlightMenuProps) => {
  const colors = [
    { name: 'yellow', bg: 'bg-yellow-300', hover: 'hover:bg-yellow-400' },
    { name: 'blue', bg: 'bg-blue-300', hover: 'hover:bg-blue-400' },
    { name: 'green', bg: 'bg-green-300', hover: 'hover:bg-green-400' },
    { name: 'pink', bg: 'bg-pink-300', hover: 'hover:bg-pink-400' },
  ];

  return (
    <div 
      className="absolute z-50 flex items-center gap-1 rounded-lg border border-border bg-popover shadow-lg px-2 py-1.5"
      style={{ 
        top: position.y - 48, 
        left: position.x,
        transform: 'translateX(-50%)' 
      }}
    >
      {/* Color options */}
      {colors.map(color => (
        <button
          key={color.name}
          onClick={(e) => { e.stopPropagation(); onHighlight(color.name); }}
          className={`h-5 w-5 rounded-full ${color.bg} ${color.hover} transition-colors border border-white/50`}
          title={`Highlight in ${color.name}`}
        />
      ))}
      <div className="w-px h-4 bg-border mx-1" />
      <button
        onClick={(e) => { e.stopPropagation(); onNote(); }}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
        title="Add Note"
      >
        <MessageSquare className="h-3 w-3" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
        title="Bookmark"
      >
        <Bookmark className="h-3 w-3" />
      </button>
    </div>
  );
};

interface ArticleSectionProps {
  id: string;
  title: string;
  content: string;
  level: number;
  highlights: UserHighlight[];
  showHighlights: boolean;
  sectionId: string;
  onTextSelect: (
    selectedText: string,
    startOffset: number,
    endOffset: number,
    sectionId: string,
    position: { x: number; y: number }
  ) => void;
}

export function ArticleSection({ 
  id,
  title, 
  content, 
  level, 
  highlights,
  showHighlights,
  sectionId,
  onTextSelect
}: ArticleSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    onTextSelect(
      selectedText,
      startOffset,
      endOffset,
      sectionId,
      {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top
      }
    );
  }, [sectionId, onTextSelect]);

  const getHighlightColor = (color: string): string => {
    const colors: Record<string, string> = {
      yellow: 'rgba(253, 224, 71, 0.5)',
      blue: 'rgba(147, 197, 253, 0.5)',
      green: 'rgba(134, 239, 172, 0.5)',
      pink: 'rgba(249, 168, 212, 0.5)',
    };
    return colors[color] || 'rgba(253, 224, 71, 0.5)';
  };

  return (
    <section 
      id={`section-${id}`} 
      className="mb-10 scroll-mt-6"
      ref={containerRef}
      onMouseUp={handleMouseUp}
    >
      {level === 1 ? (
        <h2 className="mb-4 text-[19px] font-bold uppercase tracking-wider text-primary">
          {title}
        </h2>
      ) : (
        <h3 className="mb-4 text-[17px] font-bold text-foreground">
          {title}
        </h3>
      )}
      <div 
        className="prose-content text-[17px] leading-[1.7] text-foreground/90 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-foreground [&_i]:italic"
        dangerouslySetInnerHTML={{ __html: content }}
        style={showHighlights ? {
          // Highlights are purely visual feedback through the floating menu
        } : {}}
      />
    </section>
  );
}

interface ArticleReaderProps {
  articleId: string;
  sections: Array<{ id: string; title: string; content: string; level: number; order_index: number }>;
  highlights: UserHighlight[];
  showHighlights: boolean;
  onAddHighlight: (
    sectionId: string | null,
    selectedText: string,
    startOffset: number,
    endOffset: number,
    color: string
  ) => void;
  onAddBookmarkSection: (sectionId: string) => void;
}

export function ArticleReader({
  articleId,
  sections,
  highlights,
  showHighlights,
  onAddHighlight,
  onAddBookmarkSection
}: ArticleReaderProps) {
  const [highlightMenu, setHighlightMenu] = useState<{
    visible: boolean;
    selectedText: string;
    startOffset: number;
    endOffset: number;
    sectionId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const handleTextSelect = useCallback((
    selectedText: string,
    startOffset: number,
    endOffset: number,
    sectionId: string,
    position: { x: number; y: number }
  ) => {
    setHighlightMenu({
      visible: true,
      selectedText,
      startOffset,
      endOffset,
      sectionId,
      position
    });
  }, []);

  const handleHighlight = useCallback((color: string) => {
    if (!highlightMenu) return;
    
    onAddHighlight(
      highlightMenu.sectionId,
      highlightMenu.selectedText,
      highlightMenu.startOffset,
      highlightMenu.endOffset,
      color
    );
    
    setHighlightMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [highlightMenu, onAddHighlight]);

  const handleBookmarkSection = useCallback(() => {
    if (!highlightMenu) return;
    onAddBookmarkSection(highlightMenu.sectionId);
    setHighlightMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [highlightMenu, onAddBookmarkSection]);

  const dismissMenu = () => {
    setHighlightMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={readerRef} className="relative" onClick={dismissMenu}>
      {sections.map(section => (
        <ArticleSection
          key={section.id}
          id={section.id}
          title={section.title}
          content={section.content}
          level={section.level}
          highlights={highlights.filter(h => h.section_id === section.id)}
          showHighlights={showHighlights}
          sectionId={section.id}
          onTextSelect={handleTextSelect}
        />
      ))}

      {/* Floating Highlight Menu */}
      {highlightMenu?.visible && (
        <HighlightMenu
          position={highlightMenu.position}
          onHighlight={handleHighlight}
          onNote={() => setShowNoteInput(true)}
          onBookmark={handleBookmarkSection}
        />
      )}
    </div>
  );
}