-- Add public IDs and new taxonomies to questions and tests

-- Create systems table
CREATE TABLE IF NOT EXISTS public.systems (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_sets table
CREATE TABLE IF NOT EXISTS public.question_sets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS public_id BIGSERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS system_id UUID REFERENCES public.systems(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS question_set_id UUID REFERENCES public.question_sets(id) ON DELETE SET NULL;

-- Add new columns to tests table
ALTER TABLE public.tests
ADD COLUMN IF NOT EXISTS public_id BIGSERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS source_mode TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS filters_json JSONB,
ADD COLUMN IF NOT EXISTS custom_question_ids JSONB;

-- Enable RLS for new tables
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;

-- Policies for new tables (readable by all authenticated, manageable by admins)
CREATE POLICY "Systems are viewable by everyone" ON public.systems FOR SELECT USING (true);
CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Question sets are viewable by everyone" ON public.question_sets FOR SELECT USING (true);

-- Assuming is_admin function exists as per previous context
CREATE POLICY "Admins can manage systems" ON public.systems FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage topics" ON public.topics FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage question sets" ON public.question_sets FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
