import { useState, useRef, useCallback } from "react";
import { UserHighlight } from "@/hooks/useMedicalLibrary";
import { MessageSquare, Bookmark, X } from "lucide-react";

interface HighlightMenuProps {
  onHighlight: (color: string) => void;
  onNote: () => void;
  onBookmark: () => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const highlightColors = [
  { name: 'yellow', bg: 'bg-yellow-400', border: 'border-yellow-500', hover: 'hover:scale-110' },
  { name: 'blue', bg: 'bg-blue-400', border: 'border-blue-500', hover: 'hover:scale-110' },
  { name: 'green', bg: 'bg-green-400', border: 'border-green-500', hover: 'hover:scale-110' },
  { name: 'pink', bg: 'bg-pink-400', border: 'border-pink-500', hover: 'hover:scale-110' },
];

const HighlightMenu = ({ onHighlight, onNote, onBookmark, onClose, position }: HighlightMenuProps) => {
  return (
    <div 
      className="absolute z-50 flex items-center gap-1.5 rounded-xl border border-border bg-popover/95 backdrop-blur-sm shadow-xl px-3 py-2 animate-in fade-in-0 zoom-in-95"
      style={{ 
        top: position.y - 54, 
        left: position.x,
        transform: 'translateX(-50%)' 
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color options */}
      <div className="flex items-center gap-1.5">
        {highlightColors.map(color => (
          <button
            key={color.name}
            onClick={(e) => { e.stopPropagation(); onHighlight(color.name); }}
            className={`h-6 w-6 rounded-full ${color.bg} ${color.hover} transition-all duration-150 border-2 border-white/60 shadow-sm`}
            title={`Highlight in ${color.name}`}
          />
        ))}
      </div>
      
      <div className="w-px h-5 bg-border mx-1.5" />
      
      <button
        onClick={(e) => { e.stopPropagation(); onNote(); }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        title="Add Note"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Note</span>
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        title="Bookmark"
      >
        <Bookmark className="h-3.5 w-3.5" />
        <span>Save</span>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
        title="Close"
      >
        <X className="h-3.5 w-3.5" />
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
    if (!selectedText || selectedText.length < 3) return;

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

  return (
    <section 
      id={`section-${id}`} 
      className="mb-10 scroll-mt-8"
      ref={containerRef}
      onMouseUp={handleMouseUp}
    >
      {level === 1 ? (
        <h2 className="mb-5 text-lg font-bold uppercase tracking-widest text-primary flex items-center gap-3">
          <span className="h-px flex-1 max-w-8 bg-primary/30" />
          {title}
          <span className="h-px flex-1 bg-primary/30" />
        </h2>
      ) : (
        <h3 className="mb-4 text-base font-semibold text-foreground">
          {title}
        </h3>
      )}
      <div 
        className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed text-foreground/85 
          [&_p]:mb-4 
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
          [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
          [&_li]:leading-relaxed
          [&_strong]:font-semibold [&_strong]:text-foreground 
          [&_em]:italic [&_em]:text-foreground/90
          [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-6 [&_h4]:mb-3
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_table]:w-full [&_table]:border-collapse [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:border [&_th]:border-border
          [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-border
          selection:bg-primary/20"
        dangerouslySetInnerHTML={{ __html: content }}
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

  const dismissMenu = useCallback(() => {
    setHighlightMenu(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Don't dismiss on click inside reader - only dismiss when clicking outside or pressing escape
  const handleReaderClick = useCallback((e: React.MouseEvent) => {
    // Only dismiss if clicking directly on the reader container, not on content
    if (e.target === readerRef.current) {
      dismissMenu();
    }
  }, [dismissMenu]);

  return (
    <div ref={readerRef} className="relative" onClick={handleReaderClick}>
      {sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content available for this article.</p>
        </div>
      ) : (
        sections.map(section => (
          <ArticleSection
            key={section.id}
            id={section.id}
            title={section.title}
            content={section.content}
            level={section.level ?? 1}
            highlights={highlights.filter(h => h.section_id === section.id)}
            showHighlights={showHighlights}
            sectionId={section.id}
            onTextSelect={handleTextSelect}
          />
        ))
      )}

      {/* Floating Highlight Menu */}
      {highlightMenu?.visible && (
        <HighlightMenu
          position={highlightMenu.position}
          onHighlight={handleHighlight}
          onNote={() => {
            // TODO: Open note input
            dismissMenu();
          }}
          onBookmark={handleBookmarkSection}
          onClose={dismissMenu}
        />
      )}
    </div>
  );
}
