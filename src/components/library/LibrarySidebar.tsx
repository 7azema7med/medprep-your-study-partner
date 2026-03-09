import { useState } from "react";
import { Search, Bookmark, FileText, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { MedicalLibraryCategory, MedicalLibraryArticle, UserBookmark } from "@/hooks/useMedicalLibrary";

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
  getReadStatus
}: LibrarySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

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

  if (showBookmarks) {
    return (
      <aside className="flex w-[32%] min-w-[280px] max-w-[400px] shrink-0 flex-col border-r border-border bg-muted/20">
        {/* Search Field */}
        <div className="p-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Medical Library" 
              className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Bookmarks Header */}
        <button 
          onClick={() => setShowBookmarks(false)}
          className="flex items-center gap-3 px-5 py-3 text-[16px] text-foreground bg-muted/50 font-medium"
        >
          <Bookmark className="h-[18px] w-[18px] text-primary fill-primary" />
          Bookmarks ({bookmarks.length})
        </button>
        
        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {bookmarks.map(bookmark => (
            <button
              key={bookmark.id}
              onClick={() => {
                if (bookmark.article) {
                  onArticleSelect(bookmark.article);
                  setShowBookmarks(false);
                }
              }}
              className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-[18px] w-[18px] text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px] text-foreground truncate">
                  {bookmark.article?.title}
                </div>
                {bookmark.section && (
                  <div className="text-[13px] text-muted-foreground truncate">
                    {bookmark.section.title}
                  </div>
                )}
                <div className="text-[12px] text-muted-foreground mt-1">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
          {bookmarks.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No bookmarks yet</p>
              <p className="text-xs mt-1">Bookmark articles to find them quickly</p>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[32%] min-w-[280px] max-w-[400px] shrink-0 flex-col border-r border-border bg-muted/20">
      {/* Search Field */}
      <div className="p-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Medical Library" 
            className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>
      
      {/* Bookmarks Row */}
      <button 
        onClick={() => setShowBookmarks(true)}
        className="flex items-center gap-3 px-5 py-3 text-[16px] text-foreground hover:bg-muted/50 transition-colors"
      >
        <Bookmark className="h-[18px] w-[18px] text-muted-foreground" />
        Bookmarks {bookmarks.length > 0 && `(${bookmarks.length})`}
      </button>
      
      {/* Divider */}
      <div className="mx-4 my-1 border-t border-border" />

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors">
          <FileText className="h-[18px] w-[18px] text-muted-foreground" />
          Welcome To The Medical Library
        </button>
        
        {searchQuery ? (
          /* Search Results */
          <div className="mt-2">
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Search Results ({filteredArticles.length})
            </div>
            {filteredArticles.map(article => {
              const isSelected = selectedArticleId === article.id;
              const readStatus = getReadStatus(article.id);
              
              return (
                <button
                  key={article.id}
                  onClick={() => onArticleSelect(article)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[15px] text-left transition-colors ${
                    isSelected ? "bg-muted/80 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <FileText className={`h-[16px] w-[16px] ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{article.title}</div>
                    {article.tags && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {article.tags.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                  {readStatus === 'read' && (
                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                  {readStatus === 'in_progress' && (
                    <div className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Category Tree */
          rootCategories.map(category => {
            const subcategories = getSubcategories(category.id);
            const categoryArticles = getArticlesByCategory(category.id);
            const isExpanded = expandedCategories.includes(category.id);
            
            return (
              <div key={category.id} className="mt-1 flex flex-col">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Folder className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="flex-1 text-left">{category.name}</span>
                  {(subcategories.length > 0 || categoryArticles.length > 0) && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                </button>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="ml-6 mt-1 flex flex-col space-y-1">
                    {/* Subcategories */}
                    {subcategories.map(subcategory => {
                      const subCategoryArticles = getArticlesByCategory(subcategory.id);
                      const isSubExpanded = expandedCategories.includes(subcategory.id);
                      
                      return (
                        <div key={subcategory.id} className="flex flex-col">
                          <button 
                            onClick={() => toggleCategory(subcategory.id)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Folder className="h-[16px] w-[16px] text-muted-foreground" />
                            <span className="flex-1 text-left">{subcategory.name}</span>
                            {subCategoryArticles.length > 0 && (
                              isSubExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )
                            )}
                          </button>
                          
                          {/* Articles in subcategory */}
                          {isSubExpanded && (
                            <div className="ml-6 mt-1 flex flex-col space-y-1">
                              {subCategoryArticles.map(article => {
                                const isSelected = selectedArticleId === article.id;
                                const readStatus = getReadStatus(article.id);
                                
                                return (
                                  <button
                                    key={article.id}
                                    onClick={() => onArticleSelect(article)}
                                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] text-left transition-colors ${
                                      isSelected ? "bg-muted/80 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                                    }`}
                                  >
                                    <FileText className={`h-[14px] w-[14px] ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="flex-1 truncate">{article.title}</span>
                                    {readStatus === 'read' && (
                                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                    )}
                                    {readStatus === 'in_progress' && (
                                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                    )}
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
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] text-left transition-colors ${
                            isSelected ? "bg-muted/80 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <FileText className={`h-[16px] w-[16px] ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="flex-1 truncate">{article.title}</span>
                          {readStatus === 'read' && (
                            <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                          )}
                          {readStatus === 'in_progress' && (
                            <div className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}