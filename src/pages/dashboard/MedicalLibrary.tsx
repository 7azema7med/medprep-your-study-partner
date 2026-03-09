import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalLibrary } from "@/hooks/useMedicalLibrary";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import { ArticleReader } from "@/components/library/ArticleReader";
import { ArticleToolbar } from "@/components/library/ArticleToolbar";
import { UtilityBar } from "@/components/library/UtilityBar";

export default function MedicalLibrary() {
  const { user } = useAuth();
  const [showHighlights, setShowHighlights] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  const {
    categories,
    articles,
    selectedArticle,
    sections,
    highlights,
    bookmarks,
    loading,
    searchQuery,
    setSearchQuery,
    selectArticle,
    addHighlight,
    addBookmark,
    removeBookmark,
    updateReadProgress,
    getArticlesByCategory,
    isBookmarked,
    getReadStatus
  } = useMedicalLibrary();

  // Auto-select first article on load
  useEffect(() => {
    if (!selectedArticle && articles.length > 0 && !loading) {
      selectArticle(articles[0]);
    }
  }, [articles, selectedArticle, loading, selectArticle]);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    if (!selectedArticle || sections.length === 0) return;

    const container = document.getElementById('article-scroll-container');
    if (!container) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const sectionId = visibleEntries[0].target.id.replace('section-', '');
          setActiveSectionId(sectionId);
        }
      },
      { 
        root: container,
        rootMargin: '-10% 0px -70% 0px' 
      }
    );

    sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selectedArticle, sections]);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleThemeToggle = () => {
    const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', theme);
  };

  const handleAddHighlight = async (
    sectionId: string | null,
    selectedText: string,
    startOffset: number,
    endOffset: number,
    color: string
  ) => {
    if (!selectedArticle) return;
    await addHighlight(selectedArticle.id, sectionId, selectedText, startOffset, endOffset, color);
  };

  const handleBookmarkArticle = async () => {
    if (!selectedArticle) return;
    
    const isCurrentlyBookmarked = isBookmarked(selectedArticle.id);
    if (isCurrentlyBookmarked) {
      await removeBookmark(selectedArticle.id);
    } else {
      await addBookmark(selectedArticle.id, null, 'article');
    }
  };

  const handleBookmarkSection = async (sectionId: string) => {
    if (!selectedArticle) return;
    await addBookmark(selectedArticle.id, sectionId, 'section');
  };

  const handleMarkAsRead = async () => {
    if (!selectedArticle) return;
    
    const currentStatus = getReadStatus(selectedArticle.id);
    const newStatus = currentStatus === 'read' ? 'in_progress' : 'read';
    await updateReadProgress(selectedArticle.id, newStatus, newStatus === 'read' ? 100 : 50);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the Medical Library.</p>
          <Link to="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
      <LibraryHeader 
        onFullscreen={handleFullscreen}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        <LibrarySidebar
          categories={categories}
          articles={articles}
          bookmarks={bookmarks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedArticleId={selectedArticle?.id || null}
          onArticleSelect={selectArticle}
          getArticlesByCategory={getArticlesByCategory}
          getReadStatus={getReadStatus}
        />

        {/* Draggable divider hint (static for visual) */}
        <div className="w-[1px] cursor-col-resize bg-border hover:bg-primary transition-colors" />

        {/* Main Content Panel */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
          <div 
            id="article-scroll-container" 
            className="flex-1 overflow-y-auto px-10 py-10 lg:px-20 lg:py-14 scroll-smooth"
          >
            <div className="mx-auto max-w-[800px] pb-32">
              {/* Top Navigation */}
              <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              {selectedArticle ? (
                <>
                  {/* Article Title */}
                  <h1 className="mb-4 text-[34px] font-bold tracking-tight text-foreground">
                    {selectedArticle.title}
                  </h1>
                  
                  {/* Category Tags */}
                  {selectedArticle.tags && (
                    <div className="mb-8 flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border bg-muted/20 px-4 py-1.5 text-[13px] font-medium text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Article Toolbar */}
                  <ArticleToolbar
                    showHighlights={showHighlights}
                    onToggleHighlights={() => setShowHighlights(!showHighlights)}
                    isBookmarked={isBookmarked(selectedArticle.id)}
                    onBookmark={handleBookmarkArticle}
                    readStatus={getReadStatus(selectedArticle.id)}
                    onMarkAsRead={handleMarkAsRead}
                  />

                  {/* Article Body */}
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading article content...</p>
                      </div>
                    </div>
                  ) : (
                    <ArticleReader
                      articleId={selectedArticle.id}
                      sections={sections}
                      highlights={highlights}
                      showHighlights={showHighlights}
                      onAddHighlight={handleAddHighlight}
                      onAddBookmarkSection={handleBookmarkSection}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Welcome to Medical Library</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Select an article from the sidebar to start reading. Use the search function to find specific topics.
                    </p>
                    {loading && (
                      <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Utility Bar */}
          <UtilityBar />
        </main>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-border bg-background py-3 text-center text-[13px] text-muted-foreground">
        Copyright © Coursology. All rights reserved
      </footer>
    </div>
  );
}