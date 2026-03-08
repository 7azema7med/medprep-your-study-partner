import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExamQuestion, ExamSession, UserAnswer, QuestionNote,
  QuestionHighlight, QuestionStrikeout, ExamSettings, ExamResult
} from "@/lib/exam-types";

interface ExamState {
  // Session
  session: ExamSession | null;
  questions: ExamQuestion[];
  currentIndex: number;
  isReviewMode: boolean;
  result: ExamResult | null;

  // Per-question state
  answers: Record<string, UserAnswer>;
  notes: Record<string, string>;
  highlights: QuestionHighlight[];
  strikeouts: Record<string, Set<string>>; // questionId -> Set<choiceId>
  strikeoutsArray: Record<string, string[]>; // serializable version

  // Timer
  elapsedSeconds: number;
  timerRunning: boolean;

  // UI state
  sidebarOpen: boolean;
  showExplanation: Record<string, boolean>;
  activeDialog: string | null; // "notes" | "lab" | "calc" | "settings" | "shortcuts" | "feedback" | "submit" | null

  // Settings
  settings: ExamSettings;

  // Actions
  setSession: (session: ExamSession) => void;
  setQuestions: (questions: ExamQuestion[]) => void;
  setCurrentIndex: (index: number) => void;
  selectAnswer: (questionId: string, choiceId: string) => void;
  toggleMark: (questionId: string) => void;
  toggleFlag: (questionId: string) => void;
  toggleStrikeout: (questionId: string, choiceId: string) => void;
  setNote: (questionId: string, text: string) => void;
  addHighlight: (highlight: QuestionHighlight) => void;
  removeHighlight: (highlightId: string) => void;
  tick: () => void;
  setTimerRunning: (running: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveDialog: (dialog: string | null) => void;
  setShowExplanation: (questionId: string, show: boolean) => void;
  submitExam: () => ExamResult;
  enterReviewMode: () => void;
  updateSettings: (settings: Partial<ExamSettings>) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  reset: () => void;
}

const defaultSettings: ExamSettings = {
  fontSize: "medium",
  theme: "light",
  lineSpacing: "normal",
  showTimer: true,
  confirmBeforeSubmit: true,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      session: null,
      questions: [],
      currentIndex: 0,
      isReviewMode: false,
      result: null,
      answers: {},
      notes: {},
      highlights: [],
      strikeouts: {},
      strikeoutsArray: {},
      elapsedSeconds: 0,
      timerRunning: false,
      sidebarOpen: true,
      showExplanation: {},
      activeDialog: null,
      settings: defaultSettings,

      setSession: (session) => set({ session }),
      setQuestions: (questions) => set({ questions }),
      setCurrentIndex: (index) => set({ currentIndex: index }),

      selectAnswer: (questionId, choiceId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              question_id: questionId,
              selected_choice_id: choiceId,
              is_marked: state.answers[questionId]?.is_marked ?? false,
              is_flagged: state.answers[questionId]?.is_flagged ?? false,
              answered_at: new Date().toISOString(),
            },
          },
        })),

      toggleMark: (questionId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              question_id: questionId,
              selected_choice_id: state.answers[questionId]?.selected_choice_id ?? null,
              is_marked: !(state.answers[questionId]?.is_marked ?? false),
              is_flagged: state.answers[questionId]?.is_flagged ?? false,
            },
          },
        })),

      toggleFlag: (questionId) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              question_id: questionId,
              selected_choice_id: state.answers[questionId]?.selected_choice_id ?? null,
              is_marked: state.answers[questionId]?.is_marked ?? false,
              is_flagged: !(state.answers[questionId]?.is_flagged ?? false),
            },
          },
        })),

      toggleStrikeout: (questionId, choiceId) =>
        set((state) => {
          const current = state.strikeoutsArray[questionId] || [];
          const has = current.includes(choiceId);
          const updated = has ? current.filter((c) => c !== choiceId) : [...current, choiceId];
          return {
            strikeoutsArray: { ...state.strikeoutsArray, [questionId]: updated },
          };
        }),

      setNote: (questionId, text) =>
        set((state) => ({ notes: { ...state.notes, [questionId]: text } })),

      addHighlight: (highlight) =>
        set((state) => ({ highlights: [...state.highlights, highlight] })),

      removeHighlight: (highlightId) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== highlightId),
        })),

      tick: () =>
        set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

      setTimerRunning: (running) => set({ timerRunning: running }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveDialog: (dialog) => set({ activeDialog: dialog }),

      setShowExplanation: (questionId, show) =>
        set((state) => ({
          showExplanation: { ...state.showExplanation, [questionId]: show },
        })),

      submitExam: () => {
        const { questions, answers } = get();
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach((q) => {
          const answer = answers[q.id];
          if (!answer?.selected_choice_id) {
            unanswered++;
          } else {
            const choice = q.choices.find((c) => c.id === answer.selected_choice_id);
            if (choice?.is_correct) correct++;
            else incorrect++;
          }
        });

        const result: ExamResult = {
          total: questions.length,
          correct,
          incorrect,
          unanswered,
          score_percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
        };

        // Show all explanations
        const showExplanation: Record<string, boolean> = {};
        questions.forEach((q) => { showExplanation[q.id] = true; });

        set({ result, isReviewMode: true, timerRunning: false, showExplanation });
        return result;
      },

      enterReviewMode: () => set({ isReviewMode: true }),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      nextQuestion: () =>
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
        })),

      reset: () =>
        set({
          session: null,
          questions: [],
          currentIndex: 0,
          isReviewMode: false,
          result: null,
          answers: {},
          notes: {},
          highlights: [],
          strikeouts: {},
          strikeoutsArray: {},
          elapsedSeconds: 0,
          timerRunning: false,
          sidebarOpen: true,
          showExplanation: {},
          activeDialog: null,
        }),
    }),
    {
      name: "medprep-exam-store",
      partialize: (state) => ({
        answers: state.answers,
        notes: state.notes,
        strikeoutsArray: state.strikeoutsArray,
        highlights: state.highlights,
        elapsedSeconds: state.elapsedSeconds,
        currentIndex: state.currentIndex,
        settings: state.settings,
        showExplanation: state.showExplanation,
        isReviewMode: state.isReviewMode,
        result: state.result,
      }),
    }
  )
);
