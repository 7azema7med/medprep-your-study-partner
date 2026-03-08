export interface ExamQuestion {
  id: string;
  question_text: string;
  question_image?: string | null;
  explanation?: string | null;
  educational_objective?: string | null;
  position: number;
  public_id?: number | string | null;
  choices: ExamChoice[];
}

export interface ExamChoice {
  id: string;
  choice_letter: string;
  choice_text: string;
  is_correct: boolean;
  explanation?: string | null;
}

export interface ExamSession {
  id: string;
  test_id: string;
  mode: "timed" | "tutor";
  status: "in_progress" | "submitted" | "suspended";
  total_questions: number;
  elapsed_seconds: number;
  duration_seconds: number;
  started_at: string;
  submitted_at?: string | null;
}

export interface UserAnswer {
  question_id: string;
  selected_choice_id: string | null;
  is_marked: boolean;
  is_flagged: boolean;
  answered_at?: string | null;
}

export interface QuestionNote {
  question_id: string;
  note_text: string;
}

export interface QuestionHighlight {
  id: string;
  question_id: string;
  target_type: "stem" | "choice";
  target_id?: string | null;
  selected_text: string;
  start_offset: number;
  end_offset: number;
  color: string;
}

export interface QuestionStrikeout {
  question_id: string;
  choice_id: string;
}

export interface LabValueCategory {
  id: string;
  name: string;
  values: LabValue[];
}

export interface LabValue {
  name: string;
  unit: string;
  reference_range: string;
}

export interface ExamSettings {
  fontSize: "small" | "medium" | "large";
  theme: "light" | "dark";
  lineSpacing: "compact" | "normal" | "relaxed";
  showTimer: boolean;
  confirmBeforeSubmit: boolean;
}

export interface ExamResult {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score_percentage: number;
}
