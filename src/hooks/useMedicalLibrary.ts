import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MedicalLibraryCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  order_index: number;
  articles?: MedicalLibraryArticle[];
}

export interface MedicalLibraryArticle {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  summary: string | null;
  tags: string[] | null;
  is_published: boolean;
  sections?: MedicalLibrarySection[];
}

export interface MedicalLibrarySection {
  id: string;
  article_id: string;
  title: string;
  content: string;
  level: number;
  order_index: number;
}

export interface UserHighlight {
  id: string;
  user_id: string;
  article_id: string;
  section_id: string | null;
  selected_text: string;
  start_offset: number;
  end_offset: number;
  highlight_color: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  article_id: string;
  section_id: string | null;
  bookmark_type: string;
  created_at: string;
  article?: MedicalLibraryArticle;
  section?: MedicalLibrarySection;
}

export interface UserReadProgress {
  id: string;
  user_id: string;
  article_id: string;
  status: 'unread' | 'in_progress' | 'read';
  progress_percentage: number;
  last_section_id: string | null;
}

export const useMedicalLibrary = () => {
  const [categories, setCategories] = useState<MedicalLibraryCategory[]>([]);
  const [articles, setArticles] = useState<MedicalLibraryArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<MedicalLibraryArticle | null>(null);
  const [sections, setSections] = useState<MedicalLibrarySection[]>([]);
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [readProgress, setReadProgress] = useState<UserReadProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_library_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_library_articles')
        .select('*')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchSections = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_library_sections')
        .select('*')
        .eq('article_id', articleId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
  };

  const fetchUserHighlights = async (articleId: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching highlights:', error);
      return [];
    }
  };

  const fetchUserBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          *,
          article:medical_library_articles(*),
          section:medical_library_sections(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const selectArticle = async (article: MedicalLibraryArticle) => {
    setSelectedArticle(article);
    setLoading(true);

    const [sectionsData, highlightsData] = await Promise.all([
      fetchSections(article.id),
      fetchUserHighlights(article.id)
    ]);

    setSections(sectionsData);
    setHighlights(highlightsData);
    
    // Update read progress
    if (user) {
      updateReadProgress(article.id, 'in_progress');
    }
    
    setLoading(false);
  };

  const addHighlight = async (
    articleId: string,
    sectionId: string | null,
    selectedText: string,
    startOffset: number,
    endOffset: number,
    color: string = 'yellow'
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_highlights')
        .insert({
          user_id: user.id,
          article_id: articleId,
          section_id: sectionId,
          selected_text: selectedText,
          start_offset: startOffset,
          end_offset: endOffset,
          highlight_color: color
        })
        .select()
        .single();

      if (error) throw error;
      
      setHighlights(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  };

  const addBookmark = async (
    articleId: string,
    sectionId: string | null = null,
    bookmarkType: string = 'article'
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          section_id: sectionId,
          bookmark_type: bookmarkType
        });

      if (error) throw error;
      
      fetchUserBookmarks(); // Refresh bookmarks
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeBookmark = async (articleId: string, sectionId: string | null = null) => {
    if (!user) return;

    try {
      let query = supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      } else {
        query = query.is('section_id', null);
      }

      const { error } = await query;
      if (error) throw error;
      
      fetchUserBookmarks(); // Refresh bookmarks
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const updateReadProgress = async (
    articleId: string,
    status: 'unread' | 'in_progress' | 'read',
    progressPercentage: number = 0
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_read_progress')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          status,
          progress_percentage: progressPercentage
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating read progress:', error);
    }
  };

  const searchArticles = (query: string) => {
    if (!query.trim()) return articles;
    
    const lowercaseQuery = query.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.summary?.toLowerCase().includes(lowercaseQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getArticlesByCategory = (categoryId: string) => {
    return articles.filter(article => article.category_id === categoryId);
  };

  const isBookmarked = (articleId: string, sectionId: string | null = null) => {
    return bookmarks.some(bookmark => 
      bookmark.article_id === articleId && 
      bookmark.section_id === sectionId
    );
  };

  const getReadStatus = (articleId: string): 'unread' | 'in_progress' | 'read' => {
    const progress = readProgress.find(p => p.article_id === articleId);
    return progress?.status || 'unread';
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchArticles()
      ]);
      
      if (user) {
        await fetchUserBookmarks();
      }
      
      setLoading(false);
    };

    initializeData();
  }, [user]);

  return {
    categories,
    articles,
    selectedArticle,
    sections,
    highlights,
    bookmarks,
    readProgress,
    loading,
    searchQuery,
    setSearchQuery,
    selectArticle,
    addHighlight,
    addBookmark,
    removeBookmark,
    updateReadProgress,
    searchArticles,
    getArticlesByCategory,
    isBookmarked,
    getReadStatus
  };
};