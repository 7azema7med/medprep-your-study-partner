
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  country TEXT,
  phone TEXT,
  activation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  question_count INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'subject' CHECK (category IN ('subject', 'system'))
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT TO authenticated USING (true);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id),
  question_text TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by authenticated" ON public.questions FOR SELECT TO authenticated USING (true);

-- Create answer_choices table
CREATE TABLE public.answer_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  choice_letter CHAR(1) NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  explanation TEXT
);

ALTER TABLE public.answer_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Choices viewable by authenticated" ON public.answer_choices FOR SELECT TO authenticated USING (true);

-- Create tests table
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT,
  mode TEXT NOT NULL DEFAULT 'timed' CHECK (mode IN ('timed', 'tutor')),
  question_mode TEXT NOT NULL DEFAULT 'standard' CHECK (question_mode IN ('standard', 'custom')),
  num_questions INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  score NUMERIC,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tests" ON public.tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tests" ON public.tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tests" ON public.tests FOR UPDATE USING (auth.uid() = user_id);

-- Create test_questions (join table)
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  question_order INTEGER NOT NULL,
  selected_answer UUID REFERENCES public.answer_choices(id),
  is_correct BOOLEAN,
  is_marked BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own test questions" ON public.test_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tests WHERE tests.id = test_questions.test_id AND tests.user_id = auth.uid())
);
CREATE POLICY "Users can insert own test questions" ON public.test_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tests WHERE tests.id = test_questions.test_id AND tests.user_id = auth.uid())
);
CREATE POLICY "Users can update own test questions" ON public.test_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tests WHERE tests.id = test_questions.test_id AND tests.user_id = auth.uid())
);

-- Create user_question_status to track question usage
CREATE TABLE public.user_question_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'correct', 'incorrect', 'omitted', 'marked')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_question_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own status" ON public.user_question_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own status" ON public.user_question_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own status" ON public.user_question_status FOR UPDATE USING (auth.uid() = user_id);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed subjects
INSERT INTO public.subjects (name, question_count, category) VALUES
  ('Anatomy', 223, 'subject'),
  ('Behavioral science', 253, 'subject'),
  ('Histology', 29, 'subject'),
  ('Physiology', 251, 'subject'),
  ('Pharmacology', 515, 'subject'),
  ('Embryology', 74, 'subject'),
  ('Genetics', 104, 'subject'),
  ('Biostatistics', 121, 'subject'),
  ('Immunology', 108, 'subject'),
  ('Microbiology', 347, 'subject'),
  ('Pathology', 807, 'subject'),
  ('Pathophysiology', 460, 'subject'),
  ('Biochemistry', 156, 'subject'),
  ('Allergy & Immunology', 68, 'system'),
  ('Dermatology', 100, 'system'),
  ('Cardiovascular System', 319, 'system'),
  ('Pulmonary & Critical Care', 264, 'system'),
  ('Gastrointestinal & Nutrition', 269, 'system'),
  ('Hematology & Oncology', 230, 'system'),
  ('Renal, Urinary Systems & Electrolytes', 224, 'system'),
  ('Nervous System', 386, 'system'),
  ('Rheumatology/Orthopedics & Sports', 161, 'system'),
  ('Infectious Diseases', 270, 'system'),
  ('Endocrine, Diabetes & Metabolism', 199, 'system'),
  ('Female Reproductive System & Breast', 78, 'system'),
  ('Male Reproductive System', 50, 'system'),
  ('Pregnancy, Childbirth & Puerperium', 59, 'system'),
  ('Biostatistics & Epidemiology', 120, 'system'),
  ('Ear, Nose & Throat (ENT)', 37, 'system'),
  ('Psychiatric/Behavioral & Substance Use Disorder', 179, 'system'),
  ('Poisoning & Environmental Exposure', 33, 'system'),
  ('Ophthalmology', 30, 'system'),
  ('Social Sciences (Ethics/Legal/Professional)', 109, 'system'),
  ('Miscellaneous (Multisystem)', 22, 'system'),
  ('Biochemistry (General Principles)', 65, 'system'),
  ('Genetics (General Principles)', 62, 'system'),
  ('Microbiology (General Principles)', 30, 'system'),
  ('Pathology (General Principles)', 39, 'system'),
  ('Pharmacology (General Principles)', 45, 'system');
