import { useState, useRef, useCallback, useEffect } from "react";
import { X } from "lucide-react";

const highlightColors = [
  { name: "yellow", class: "bg-yellow-300/70" },
  { name: "blue", class: "bg-blue-300/70" },
  { name: "green", class: "bg-green-300/70" },
  { name: "pink", class: "bg-pink-300/70" },
];

interface HighlightMenuProps {
  position: { x: number; y: number };
  onHighlight: (color: string) => void;
  onClose: () => void;
}

function HighlightMenu({ position, onHighlight, onClose }: HighlightMenuProps) {
  return (
    <div
      className="absolute z-50 flex items-center gap-1 rounded-lg border border-border bg-popover/95 backdrop-blur-sm shadow-xl px-2 py-1.5 animate-in fade-in-0 zoom-in-95"
      style={{
        top: position.y - 44,
        left: position.x,
        transform: "translateX(-50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {highlightColors.map((color) => (
        <button
          key={color.name}
          onClick={(e) => {
            e.stopPropagation();
            onHighlight(color.name);
          }}
          className={`h-6 w-6 rounded-full ${color.class} hover:scale-110 transition-transform duration-150 border border-white/50 shadow-sm`}
          title={`Highlight in ${color.name}`}
        />
      ))}
      <div className="w-px h-4 bg-border mx-1" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Close"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface Highlight {
  id: string;
  text: string;
  color: string;
  startOffset: number;
  endOffset: number;
}

interface TextHighlighterProps {
  text: string;
  questionId: string;
  className?: string;
  highlights: Highlight[];
  onAddHighlight: (highlight: Omit<Highlight, "id">) => void;
  onRemoveHighlight?: (id: string) => void;
}

export default function TextHighlighter({
  text,
  questionId,
  className = "",
  highlights,
  onAddHighlight,
  onRemoveHighlight,
}: TextHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    selection: { text: string; start: number; end: number } | null;
  } | null>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    const range = selection.getRangeAt(0);
    
    // Make sure selection is within our container
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate offsets within the text
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(containerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    setMenu({
      visible: true,
      position: {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
      },
      selection: { text: selectedText, start, end },
    });
  }, []);

  const handleHighlight = useCallback(
    (color: string) => {
      if (!menu?.selection) return;

      onAddHighlight({
        text: menu.selection.text,
        color,
        startOffset: menu.selection.start,
        endOffset: menu.selection.end,
      });

      setMenu(null);
      window.getSelection()?.removeAllRanges();
    },
    [menu, onAddHighlight]
  );

  const dismissMenu = useCallback(() => {
    setMenu(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menu?.visible && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dismissMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menu, dismissMenu]);

  // Render text with highlights
  const renderHighlightedText = () => {
    if (highlights.length === 0) return text;

    // Sort highlights by start position
    const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
    
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sorted.forEach((hl, idx) => {
      // Add text before this highlight
      if (hl.startOffset > lastEnd) {
        parts.push(
          <span key={`text-${idx}`}>{text.slice(lastEnd, hl.startOffset)}</span>
        );
      }

      // Add highlighted text
      const colorClass = highlightColors.find((c) => c.name === hl.color)?.class || "bg-yellow-300/70";
      parts.push(
        <mark
          key={`hl-${hl.id}`}
          className={`${colorClass} px-0.5 rounded-sm cursor-pointer transition-opacity hover:opacity-80`}
          title="Right-click to remove"
          onContextMenu={(e) => {
            e.preventDefault();
            onRemoveHighlight?.(hl.id);
          }}
        >
          {text.slice(hl.startOffset, hl.endOffset)}
        </mark>
      );

      lastEnd = hl.endOffset;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} onMouseUp={handleMouseUp}>
      <div className="selection:bg-primary/20">{renderHighlightedText()}</div>

      {/* Highlight Menu */}
      {menu?.visible && (
        <HighlightMenu
          position={menu.position}
          onHighlight={handleHighlight}
          onClose={dismissMenu}
        />
      )}
    </div>
  );
}
