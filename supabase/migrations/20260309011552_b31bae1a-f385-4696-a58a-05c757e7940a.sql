-- Medical Library Categories (hierarchical structure)
CREATE TABLE public.medical_library_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.medical_library_categories(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Library Articles
CREATE TABLE public.medical_library_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.medical_library_categories(id),
  summary TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Library Sections (content within articles)
CREATE TABLE public.medical_library_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.medical_library_articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  level INTEGER DEFAULT 1, -- heading level (1, 2, 3...)
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Highlights
CREATE TABLE public.user_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.medical_library_articles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.medical_library_sections(id) ON DELETE CASCADE,
  selected_text TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  highlight_color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Notes
CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.medical_library_articles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.medical_library_sections(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES public.user_highlights(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Bookmarks
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.medical_library_articles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.medical_library_sections(id) ON DELETE CASCADE,
  bookmark_type TEXT DEFAULT 'article', -- 'article', 'section', 'highlight'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id, section_id)
);

-- User Read Progress
CREATE TABLE public.user_read_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.medical_library_articles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unread', -- 'unread', 'in_progress', 'read'
  progress_percentage INTEGER DEFAULT 0,
  last_section_id UUID REFERENCES public.medical_library_sections(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Enable RLS on all tables
ALTER TABLE public.medical_library_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_library_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_library_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_read_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Medical Library Categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.medical_library_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.medical_library_categories 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for Medical Library Articles
CREATE POLICY "Published articles are viewable by everyone" 
ON public.medical_library_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage articles" 
ON public.medical_library_articles 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for Medical Library Sections
CREATE POLICY "Sections are viewable by everyone" 
ON public.medical_library_sections 
FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.medical_library_articles 
  WHERE id = article_id AND is_published = true
));

CREATE POLICY "Admins can manage sections" 
ON public.medical_library_sections 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for User Highlights
CREATE POLICY "Users can manage their own highlights" 
ON public.user_highlights 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Notes
CREATE POLICY "Users can manage their own notes" 
ON public.user_notes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
ON public.user_bookmarks 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Read Progress
CREATE POLICY "Users can manage their own progress" 
ON public.user_read_progress 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.medical_library_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.medical_library_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.medical_library_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.user_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
BEFORE UPDATE ON public.user_read_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();