import { useState, useEffect } from "react";
import { Search, Bookmark, FileText, Folder, ChevronDown, ChevronRight, BookOpen, Hash } from "lucide-react";
import { MedicalLibraryCategory, MedicalLibraryArticle, UserBookmark, MedicalLibrarySection } from "@/hooks/useMedicalLibrary";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LibrarySidebarProps {
  categories: MedicalLibraryCategory[];
  articles: MedicalLibraryArticle[];
  bookmarks: UserBookmark[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedArticleId: string | null;
  onArticleSelect: (article: MedicalLibraryArticle) => void;
  getArticlesByCategory: (categoryId: string) => MedicalLibraryArticle[];
  getReadStatus: (articleId: string) => 'unread' | 'in_progress' | 'read';
  sections?: MedicalLibrarySection[];
  activeSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function LibrarySidebar({
  categories,
  articles,
  bookmarks,
  searchQuery,
  onSearchChange,
  selectedArticleId,
  onArticleSelect,
  getArticlesByCategory,
  getReadStatus,
  sections = [],
  activeSectionId,
  onSectionClick
}: LibrarySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSections, setShowSections] = useState(true);

  // Auto-expand category when article is selected
  useEffect(() => {
    if (selectedArticleId) {
      const article = articles.find(a => a.id === selectedArticleId);
      if (article?.category_id && !expandedCategories.includes(article.category_id)) {
        setExpandedCategories(prev => [...prev, article.category_id!]);
      }
    }
  }, [selectedArticleId, articles]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const rootCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(cat => cat.parent_id === parentId);

  const filteredArticles = searchQuery 
    ? articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : articles;

  const getStatusIndicator = (status: 'unread' | 'in_progress' | 'read') => {
    switch (status) {
      case 'read':
        return <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Read" />;
      case 'in_progress':
        return <div className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" title="In Progress" />;
      default:
        return null;
    }
  };

  // Bookmarks View
  if (showBookmarks) {
    return (
      <aside className="flex w-80 min-w-[280px] max-w-[360px] shrink-0 flex-col border-r border-border bg-card">
        {/* Search Field */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Medical Library" 
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Bookmarks Header */}
        <button 
          onClick={() => setShowBookmarks(false)}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground bg-primary/10 border-b border-border"
        >
          <Bookmark className="h-4 w-4 text-primary fill-primary" />
          <span>Bookmarks</span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        </button>
        
        {/* Bookmarks List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {bookmarks.map(bookmark => (
              <button
                key={bookmark.id}
                onClick={() => {
                  if (bookmark.article) {
                    onArticleSelect(bookmark.article);
                    setShowBookmarks(false);
                  }
                }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted/50 transition-colors group"
              >
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate group-hover:text-primary">
                    {bookmark.article?.title}
                  </div>
                  {bookmark.section && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {bookmark.section.title}
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
            {bookmarks.length === 0 && (
              <div className="px-3 py-8 text-center">
                <Bookmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
                <p className="text-xs text-muted-foreground mt-1">Bookmark articles to find them quickly</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 min-w-[280px] max-w-[360px] shrink-0 flex-col border-r border-border bg-card">
      {/* Search Field */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Medical Library" 
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      
      {/* Bookmarks Row */}
      <button 
        onClick={() => setShowBookmarks(true)}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors border-b border-border"
      >
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <span>Bookmarks</span>
        {bookmarks.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        )}
      </button>

      {/* Article Sections (when article is selected) */}
      {selectedArticleId && sections.length > 0 && (
        <div className="border-b border-border">
          <button
            onClick={() => setShowSections(!showSections)}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/30"
          >
            {showSections ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Article Sections
          </button>
          
          {showSections && (
            <div className="pb-2 px-2">
              {sections.map(section => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionClick?.(section.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-all relative ${
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                    )}
                    <Hash className={`h-3 w-3 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm truncate">{section.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Welcome item */}
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <BookOpen className="h-4 w-4 text-primary" />
            Welcome To The Medical Library
          </button>
          
          {searchQuery ? (
            /* Search Results */
            <div className="mt-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search Results ({filteredArticles.length})
              </div>
              {filteredArticles.map(article => {
                const isSelected = selectedArticleId === article.id;
                const readStatus = getReadStatus(article.id);
                
                return (
                  <button
                    key={article.id}
                    onClick={() => onArticleSelect(article)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all relative ${
                      isSelected 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                    )}
                    <FileText className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{article.title}</div>
                      {article.tags && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {article.tags.slice(0, 2).join(' • ')}
                        </div>
                      )}
                    </div>
                    {getStatusIndicator(readStatus)}
                  </button>
                );
              })}
              {filteredArticles.length === 0 && (
                <div className="px-3 py-6 text-center text-muted-foreground text-sm">
                  No articles found
                </div>
              )}
            </div>
          ) : (
            /* Category Tree */
            <div className="mt-2 space-y-1">
              {rootCategories.map(category => {
                const subcategories = getSubcategories(category.id);
                const categoryArticles = getArticlesByCategory(category.id);
                const isExpanded = expandedCategories.includes(category.id);
                
                return (
                  <div key={category.id}>
                    <button 
                      onClick={() => toggleCategory(category.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Folder className={`h-4 w-4 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-left">{category.name}</span>
                      {(subcategories.length > 0 || categoryArticles.length > 0) && (
                        <span className="text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </button>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                        {/* Subcategories */}
                        {subcategories.map(subcategory => {
                          const subCategoryArticles = getArticlesByCategory(subcategory.id);
                          const isSubExpanded = expandedCategories.includes(subcategory.id);
                          
                          return (
                            <div key={subcategory.id}>
                              <button 
                                onClick={() => toggleCategory(subcategory.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                              >
                                <Folder className={`h-3.5 w-3.5 ${isSubExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="flex-1 text-left">{subcategory.name}</span>
                                {subCategoryArticles.length > 0 && (
                                  <span className="text-muted-foreground">
                                    {isSubExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    )}
                                  </span>
                                )}
                              </button>
                              
                              {/* Articles in subcategory */}
                              {isSubExpanded && (
                                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                                  {subCategoryArticles.map(article => {
                                    const isSelected = selectedArticleId === article.id;
                                    const readStatus = getReadStatus(article.id);
                                    
                                    return (
                                      <button
                                        key={article.id}
                                        onClick={() => onArticleSelect(article)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-all relative ${
                                          isSelected 
                                            ? "bg-primary/10 text-primary font-medium" 
                                            : "text-foreground hover:bg-muted/50"
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                                        )}
                                        <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                        <span className="flex-1 truncate">{article.title}</span>
                                        {getStatusIndicator(readStatus)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Articles directly in this category */}
                        {categoryArticles.map(article => {
                          const isSelected = selectedArticleId === article.id;
                          const readStatus = getReadStatus(article.id);
                          
                          return (
                            <button
                              key={article.id}
                              onClick={() => onArticleSelect(article)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-all relative ${
                                isSelected 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                              )}
                              <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <span className="flex-1 truncate">{article.title}</span>
                              {getStatusIndicator(readStatus)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
