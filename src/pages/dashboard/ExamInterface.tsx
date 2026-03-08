import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExamStore } from "@/stores/exam-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ExamTopHeader from "@/components/exam/ExamTopHeader";
import QuestionSidebar from "@/components/exam/QuestionSidebar";
import QuestionPanel from "@/components/exam/QuestionPanel";
import ExamBottomBar from "@/components/exam/ExamBottomBar";
import LabValuesDialog from "@/components/exam/dialogs/LabValuesDialog";
import CalculatorDialog from "@/components/exam/dialogs/CalculatorDialog";
import NotesDialog from "@/components/exam/dialogs/NotesDialog";
import SettingsDialog from "@/components/exam/dialogs/SettingsDialog";
import ShortcutsDialog from "@/components/exam/dialogs/ShortcutsDialog";
import FeedbackDialog from "@/components/exam/dialogs/FeedbackDialog";
import SubmitConfirmDialog from "@/components/exam/dialogs/SubmitConfirmDialog";
import ExamResultScreen from "@/components/exam/ExamResultScreen";
import type { ExamQuestion } from "@/lib/exam-types";
import { Loader2 } from "lucide-react";

// Fallback demo questions when DB has no data
const demoQuestions: ExamQuestion[] = [
  {
    id: "demo-1", position: 1,
    question_text: "A 37-year-old man is found unresponsive next to a tree during a thunderstorm. He is not breathing when paramedics arrive. On examination, the pupils are fixed and dilated. Several erythematous marks in a fern-like pattern are seen on the skin of his lower extremities. Partial-thickness burns are present on both arms. Cardiopulmonary resuscitation is started; there is no return of spontaneous circulation, and the patient is pronounced dead shortly after arrival at the hospital. Which of the following is the most likely primary cause of death?",
    explanation: "Lightning strike causes death most commonly through cardiac arrhythmia. The massive electrical discharge can cause immediate cardiac arrest (asystole or ventricular fibrillation). The fern-like marks (Lichtenberg figures) are pathognomonic for lightning strikes. While burns are present, the primary mechanism of death is the cardiac arrhythmia induced by the electrical current passing through the body.",
    educational_objective: "Lightning strikes most commonly cause death through cardiac arrhythmia (ventricular fibrillation or asystole). Lichtenberg figures (fern-like erythematous marks) are pathognomonic for lightning injury.",
    choices: [
      { id: "d1a", choice_letter: "A", choice_text: "Carbon monoxide poisoning", is_correct: false, explanation: "CO poisoning is associated with fires in enclosed spaces, not lightning strikes." },
      { id: "d1b", choice_letter: "B", choice_text: "Cardiac arrhythmia", is_correct: true, explanation: "Correct! Lightning causes a massive electrical discharge that can induce ventricular fibrillation or asystole." },
      { id: "d1c", choice_letter: "C", choice_text: "Extensive deep tissue burns", is_correct: false, explanation: "While burns are present, lightning typically causes superficial burns. Death is from cardiac causes." },
      { id: "d1d", choice_letter: "D", choice_text: "Intracranial hemorrhage", is_correct: false, explanation: "Not the primary mechanism of death in lightning strikes." },
      { id: "d1e", choice_letter: "E", choice_text: "Pulmonary barotrauma", is_correct: false, explanation: "Barotrauma is associated with blast injuries, not lightning." },
      { id: "d1f", choice_letter: "F", choice_text: "Upper airway edema", is_correct: false, explanation: "Airway edema is seen with thermal inhalation injuries, not lightning." },
    ],
  },
  {
    id: "demo-2", position: 2,
    question_text: "A 45-year-old man presents to the emergency department with acute onset chest pain radiating to his left arm. ECG shows ST-segment elevation in leads II, III, and aVF. Which of the following coronary arteries is most likely occluded?",
    explanation: "ST-segment elevation in leads II, III, and aVF indicates an inferior myocardial infarction. The inferior wall of the heart is most commonly supplied by the right coronary artery (RCA). In approximately 85% of patients, the RCA gives rise to the posterior descending artery (right-dominant circulation).",
    educational_objective: "ST elevation in leads II, III, aVF indicates inferior MI, most commonly caused by RCA occlusion.",
    choices: [
      { id: "d2a", choice_letter: "A", choice_text: "Left anterior descending artery", is_correct: false, explanation: "LAD supplies the anterior wall; occlusion causes ST elevation in V1-V4." },
      { id: "d2b", choice_letter: "B", choice_text: "Left circumflex artery", is_correct: false, explanation: "LCx supplies the lateral wall; occlusion causes ST elevation in I, aVL, V5-V6." },
      { id: "d2c", choice_letter: "C", choice_text: "Right coronary artery", is_correct: true, explanation: "Correct! The RCA supplies the inferior wall of the heart." },
      { id: "d2d", choice_letter: "D", choice_text: "Left main coronary artery", is_correct: false, explanation: "Left main occlusion causes widespread ST changes and is usually fatal." },
      { id: "d2e", choice_letter: "E", choice_text: "Posterior descending artery", is_correct: false, explanation: "The PDA is usually a branch of the RCA." },
    ],
  },
  {
    id: "demo-3", position: 3,
    question_text: "A 28-year-old woman presents with fatigue, weight gain, constipation, and cold intolerance for the past 3 months. Physical examination reveals dry skin and delayed relaxation of deep tendon reflexes. Laboratory studies show elevated TSH and low free T4. Which of the following is the most likely diagnosis?",
    explanation: "The clinical presentation of fatigue, weight gain, constipation, cold intolerance, dry skin, and delayed DTRs with elevated TSH and low free T4 is classic for primary hypothyroidism. Hashimoto thyroiditis is the most common cause of hypothyroidism in iodine-sufficient areas.",
    educational_objective: "Hashimoto thyroiditis is the most common cause of primary hypothyroidism in developed countries.",
    choices: [
      { id: "d3a", choice_letter: "A", choice_text: "Graves disease", is_correct: false, explanation: "Graves causes hyperthyroidism with low TSH and high T4." },
      { id: "d3b", choice_letter: "B", choice_text: "Hashimoto thyroiditis", is_correct: true, explanation: "Correct! Most common cause of primary hypothyroidism." },
      { id: "d3c", choice_letter: "C", choice_text: "Subacute thyroiditis", is_correct: false, explanation: "Presents with neck pain and transient thyrotoxicosis." },
      { id: "d3d", choice_letter: "D", choice_text: "Thyroid carcinoma", is_correct: false, explanation: "Typically presents as a thyroid nodule." },
      { id: "d3e", choice_letter: "E", choice_text: "Toxic multinodular goiter", is_correct: false, explanation: "Causes hyperthyroidism, not hypothyroidism." },
    ],
  },
];

// Generate more demo questions
function generateDemoQuestions(): ExamQuestion[] {
  const topics = [
    { q: "A 55-year-old diabetic man presents with painless, progressive loss of vision in his right eye. Fundoscopic examination reveals cotton-wool spots, flame hemorrhages, and neovascularization. What is the most likely diagnosis?", correct: "Proliferative diabetic retinopathy", choices: ["Central retinal artery occlusion", "Central retinal vein occlusion", "Proliferative diabetic retinopathy", "Age-related macular degeneration", "Hypertensive retinopathy"], explanation: "Neovascularization with cotton-wool spots and hemorrhages in a diabetic patient indicates proliferative diabetic retinopathy." },
    { q: "A 22-year-old college student presents with fever, pharyngitis, lymphadenopathy, and splenomegaly. A peripheral blood smear shows atypical lymphocytes. Which virus is most likely responsible?", correct: "Epstein-Barr virus", choices: ["Cytomegalovirus", "Epstein-Barr virus", "Human herpesvirus 6", "Adenovirus", "Parvovirus B19"], explanation: "The classic triad of fever, pharyngitis, and lymphadenopathy with atypical lymphocytes is characteristic of EBV infectious mononucleosis." },
    { q: "A 60-year-old woman with a history of rheumatic heart disease presents with an irregularly irregular pulse. Her ECG confirms atrial fibrillation. What is the most feared complication requiring anticoagulation?", correct: "Systemic thromboembolism", choices: ["Heart failure", "Systemic thromboembolism", "Ventricular tachycardia", "Pericardial effusion", "Endocarditis"], explanation: "Atrial fibrillation leads to blood stasis in the left atrium, forming thrombi that can embolize systemically, most commonly to the brain causing stroke." },
    { q: "A 35-year-old man presents with episodic headache, diaphoresis, and palpitations. His blood pressure is 220/130 mmHg. A 24-hour urine collection shows elevated catecholamines and metanephrines. What is the most likely tumor?", correct: "Pheochromocytoma", choices: ["Adrenal adenoma", "Pheochromocytoma", "Neuroblastoma", "Paraganglioma", "Carcinoid tumor"], explanation: "The classic triad of headache, diaphoresis, and palpitations with hypertension and elevated catecholamines is diagnostic of pheochromocytoma." },
    { q: "A 50-year-old woman develops sudden onset severe headache described as 'the worst headache of my life.' CT of the head without contrast is normal. What is the most appropriate next step?", correct: "Lumbar puncture", choices: ["MRI of the brain", "Lumbar puncture", "CT angiography", "Repeat CT in 24 hours", "Observation and analgesics"], explanation: "A 'thunderclap headache' raises concern for subarachnoid hemorrhage. If CT is negative (which occurs in ~2-5% of SAH), lumbar puncture is the next step to look for xanthochromia." },
    { q: "A 40-year-old woman presents with bilateral hand joint stiffness worse in the morning lasting over 1 hour. She has symmetric swelling of the PIP and MCP joints. Rheumatoid factor is positive. What is the most likely diagnosis?", correct: "Rheumatoid arthritis", choices: ["Osteoarthritis", "Rheumatoid arthritis", "Psoriatic arthritis", "Gout", "Systemic lupus erythematosus"], explanation: "Symmetric inflammatory polyarthritis affecting PIP and MCP joints with prolonged morning stiffness (>1 hour) and positive RF is classic for rheumatoid arthritis." },
    { q: "A 25-year-old woman presents with a butterfly-shaped rash across her cheeks and nose, joint pain, and proteinuria. ANA is positive at 1:640. What antibody is most specific for this condition?", correct: "Anti-dsDNA", choices: ["Anti-histone", "Anti-dsDNA", "Anti-centromere", "Anti-Scl-70", "Anti-Jo-1"], explanation: "Anti-dsDNA antibodies are highly specific for systemic lupus erythematosus (SLE) and correlate with disease activity, particularly lupus nephritis." },
  ];

  return topics.map((t, i) => ({
    id: `demo-${i + 4}`,
    position: i + 4,
    question_text: t.q,
    explanation: t.explanation,
    educational_objective: t.explanation,
    choices: t.choices.map((c, ci) => ({
      id: `demo-${i + 4}-${ci}`,
      choice_letter: String.fromCharCode(65 + ci),
      choice_text: c,
      is_correct: c === t.correct,
      explanation: c === t.correct ? "This is the correct answer." : null,
    })),
  }));
}

const allDemoQuestions = [...demoQuestions, ...generateDemoQuestions()];

export default function ExamInterface() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useExamStore();
  const {
    questions, setQuestions, setSession, setTimerRunning,
    activeDialog, setActiveDialog, nextQuestion, prevQuestion,
    selectAnswer, toggleMark, setShowExplanation, isReviewMode,
    result, currentIndex, reset,
  } = store;

  // Load questions
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!testId) return;

      // Try to load from DB
      try {
        const { data: testQuestions } = await supabase
          .from("test_questions")
          .select("question_id, question_order, questions(*, answer_choices(*))")
          .eq("test_id", testId)
          .order("question_order");

        if (!cancelled && testQuestions && testQuestions.length > 0) {
          const mapped: ExamQuestion[] = testQuestions.map((tq: any) => ({
            id: tq.questions.id,
            question_text: tq.questions.question_text,
            explanation: tq.questions.explanation,
            educational_objective: null,
            position: tq.question_order,
            choices: (tq.questions.answer_choices || []).map((c: any) => ({
              id: c.id,
              choice_letter: c.choice_letter,
              choice_text: c.choice_text,
              is_correct: c.is_correct,
              explanation: c.explanation,
            })),
          }));
          setQuestions(mapped);
          setSession({
            id: testId,
            test_id: testId,
            mode: "tutor",
            status: "in_progress",
            total_questions: mapped.length,
            elapsed_seconds: 0,
            duration_seconds: 3600,
            started_at: new Date().toISOString(),
          });
          setTimerRunning(true);
          return;
        }
      } catch (e) {
        console.error("Failed to load from DB, using demo data", e);
      }

      // Fallback: demo questions
      if (!cancelled) {
        setQuestions(allDemoQuestions);
        setSession({
          id: testId,
          test_id: testId,
          mode: "tutor",
          status: "in_progress",
          total_questions: allDemoQuestions.length,
          elapsed_seconds: 0,
          duration_seconds: 3600,
          started_at: new Date().toISOString(),
        });
        setTimerRunning(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [testId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeDialog) {
        if (e.key === "Escape") setActiveDialog(null);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const q = questions[currentIndex];

      switch (e.key.toLowerCase()) {
        case "n": nextQuestion(); break;
        case "p": prevQuestion(); break;
        case "m": if (q) toggleMark(q.id); break;
        case "l": setActiveDialog("lab"); break;
        case "o": setActiveDialog("notes"); break;
        case "c": setActiveDialog("calc"); break;
        case "f":
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
          break;
        case "enter":
          if (q && store.answers[q.id]?.selected_choice_id && !store.showExplanation[q.id]) {
            setShowExplanation(q.id, true);
          }
          break;
        case "1": case "2": case "3": case "4": case "5": case "6":
          if (q && !store.showExplanation[q.id]) {
            const idx = parseInt(e.key) - 1;
            if (q.choices[idx]) selectAnswer(q.id, q.choices[idx].id);
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeDialog, questions, currentIndex, nextQuestion, prevQuestion, toggleMark, selectAnswer, setActiveDialog, setShowExplanation, store.answers, store.showExplanation]);

  // Show result screen after submission
  if (result && !isReviewMode) {
    return <ExamResultScreen />;
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading exam...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <ExamTopHeader />
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar />
        <QuestionPanel />
      </div>
      <ExamBottomBar />

      {/* Dialogs */}
      <LabValuesDialog />
      <CalculatorDialog />
      <NotesDialog />
      <SettingsDialog />
      <ShortcutsDialog />
      <FeedbackDialog />
      <SubmitConfirmDialog />
    </div>
  );
}
