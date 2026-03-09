import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalLibrary } from "@/hooks/useMedicalLibrary";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import { ArticleReader } from "@/components/library/ArticleReader";
import { ArticleToolbar } from "@/components/library/ArticleToolbar";


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

  const handleSectionClick = useCallback((sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the Medical Library.</p>
          <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5.5rem)] -m-5">
      {/* Library Sidebar */}
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
        sections={sections}
        activeSectionId={activeSectionId}
        onSectionClick={handleSectionClick}
      />

      {/* Divider */}
      <div className="w-px shrink-0 bg-border" />

      {/* Main Content Panel */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div 
          id="article-scroll-container" 
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          <div className="px-6 py-6 lg:px-12 lg:py-8">
            <div className="mx-auto max-w-3xl pb-8">
              {selectedArticle ? (
                <>
                  <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    {selectedArticle.title}
                  </h1>
                  
                  {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <ArticleToolbar
                    showHighlights={showHighlights}
                    onToggleHighlights={() => setShowHighlights(!showHighlights)}
                    isBookmarked={isBookmarked(selectedArticle.id)}
                    onBookmark={handleBookmarkArticle}
                    readStatus={getReadStatus(selectedArticle.id)}
                    onMarkAsRead={handleMarkAsRead}
                  />

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
                  <div className="text-center max-w-md">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to Medical Library</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Select an article from the sidebar to start reading.
                    </p>
                    {loading && (
                      <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}