-- Alter subjects
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Alter systems
ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);
ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create subsystems
CREATE TABLE IF NOT EXISTS public.subsystems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    system_id UUID REFERENCES public.systems(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subsystems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subsystems viewable by everyone" ON public.subsystems;
CREATE POLICY "Subsystems viewable by everyone" ON public.subsystems FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage subsystems" ON public.subsystems;
CREATE POLICY "Admins can manage subsystems" ON public.subsystems FOR ALL USING (is_admin(auth.uid()));

-- Create user_navigation_preferences
CREATE TABLE IF NOT EXISTS public.user_navigation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subject_id UUID REFERENCES public.subjects(id),
    system_id UUID REFERENCES public.systems(id),
    collapsed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, subject_id, system_id)
);

ALTER TABLE public.user_navigation_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_navigation_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_navigation_preferences 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);