CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  font_weight TEXT NOT NULL DEFAULT 'normal' CHECK (font_weight IN ('normal', 'bold')),
  color_theme TEXT NOT NULL DEFAULT 'system' CHECK (color_theme IN ('light', 'dark', 'system')),
  split_view BOOLEAN NOT NULL DEFAULT false,
  show_timer BOOLEAN NOT NULL DEFAULT true,
  pause_timer_on_blur BOOLEAN NOT NULL DEFAULT false,
  exhibit_style TEXT NOT NULL DEFAULT 'button' CHECK (exhibit_style IN ('button', 'link', 'plain')),
  line_width INTEGER NOT NULL DEFAULT 720,
  text_alignment TEXT NOT NULL DEFAULT 'left' CHECK (text_alignment IN ('left', 'center', 'right')),
  image_alignment TEXT NOT NULL DEFAULT 'center' CHECK (image_alignment IN ('left', 'center', 'right')),
  sidebar_behavior TEXT NOT NULL DEFAULT 'always_visible' CHECK (sidebar_behavior IN ('always_visible', 'auto_hide', 'hover_to_show')),
  content_padding INTEGER NOT NULL DEFAULT 24,
  night_mode_auto BOOLEAN NOT NULL DEFAULT false,
  night_mode_start TIME NOT NULL DEFAULT '18:00',
  night_mode_end TIME NOT NULL DEFAULT '06:00',
  confirm_answer_omission BOOLEAN NOT NULL DEFAULT true,
  highlight_color TEXT NOT NULL DEFAULT 'yellow',
  multicolor_highlighting BOOLEAN NOT NULL DEFAULT false,
  highlight_palette TEXT[] NOT NULL DEFAULT ARRAY['yellow']::TEXT[],
  hide_answered_correct_percent BOOLEAN NOT NULL DEFAULT false,
  auto_add_flashcard BOOLEAN NOT NULL DEFAULT false,
  auto_add_notebook BOOLEAN NOT NULL DEFAULT false,
  auto_add_annotation BOOLEAN NOT NULL DEFAULT false,
  smart_context_menu BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can view own settings'
  ) THEN
    CREATE POLICY "Users can view own settings"
      ON public.user_settings
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can insert own settings'
  ) THEN
    CREATE POLICY "Users can insert own settings"
      ON public.user_settings
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can update own settings'
  ) THEN
    CREATE POLICY "Users can update own settings"
      ON public.user_settings
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can delete own settings'
  ) THEN
    CREATE POLICY "Users can delete own settings"
      ON public.user_settings
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();