import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Flag, Calculator, FlaskConical,
  Bookmark, Clock, X, CheckCircle2, AlertCircle
} from "lucide-react";

// Mock question data for demo (will be replaced with Supabase data)
const mockQuestions = [
  {
    id: "1",
    question_text: "A 45-year-old man presents to the emergency department with acute onset chest pain radiating to his left arm. ECG shows ST-segment elevation in leads II, III, and aVF. Which of the following coronary arteries is most likely occluded?",
    explanation: "The right coronary artery (RCA) supplies the inferior wall of the heart. ST-segment elevation in leads II, III, and aVF indicates an inferior myocardial infarction, which is most commonly caused by occlusion of the RCA. The RCA supplies the SA node (in ~55% of people), AV node (in ~90% of people), and the posterior descending artery (in ~85% of people — right-dominant circulation).",
    choices: [
      { id: "a", letter: "A", text: "Left anterior descending artery", is_correct: false, explanation: "The LAD supplies the anterior wall and interventricular septum. Occlusion would cause ST elevation in V1-V4." },
      { id: "b", letter: "B", text: "Left circumflex artery", is_correct: false, explanation: "The LCx supplies the lateral wall. Occlusion would cause ST elevation in I, aVL, V5-V6." },
      { id: "c", letter: "C", text: "Right coronary artery", is_correct: true, explanation: "Correct! The RCA supplies the inferior wall of the heart." },
      { id: "d", letter: "D", text: "Left main coronary artery", is_correct: false, explanation: "Left main occlusion would cause widespread ST changes and is usually fatal." },
      { id: "e", letter: "E", text: "Posterior descending artery", is_correct: false, explanation: "The PDA is usually a branch of the RCA and supplies the posterior interventricular septum." },
    ],
  },
  {
    id: "2",
    question_text: "A 28-year-old woman presents with fatigue, weight gain, constipation, and cold intolerance for the past 3 months. Physical examination reveals dry skin and delayed relaxation of deep tendon reflexes. Laboratory studies show elevated TSH and low free T4. Which of the following is the most likely diagnosis?",
    explanation: "The clinical presentation of fatigue, weight gain, constipation, cold intolerance, dry skin, and delayed relaxation of DTRs with elevated TSH and low free T4 is classic for primary hypothyroidism. Hashimoto thyroiditis is the most common cause of hypothyroidism in iodine-sufficient areas.",
    choices: [
      { id: "a", letter: "A", text: "Graves disease", is_correct: false, explanation: "Graves disease causes hyperthyroidism with low TSH and high T4." },
      { id: "b", letter: "B", text: "Hashimoto thyroiditis", is_correct: true, explanation: "Correct! Hashimoto thyroiditis is the most common cause of primary hypothyroidism." },
      { id: "c", letter: "C", text: "Subacute thyroiditis", is_correct: false, explanation: "Subacute thyroiditis typically presents with neck pain and transient thyrotoxicosis." },
      { id: "d", letter: "D", text: "Thyroid carcinoma", is_correct: false, explanation: "Thyroid carcinoma typically presents as a thyroid nodule, not hypothyroidism." },
    ],
  },
  {
    id: "3",
    question_text: "A 65-year-old man with a history of chronic alcohol use presents with ascites, jaundice, and spider angiomata. Laboratory studies show elevated AST and ALT with an AST/ALT ratio >2. Which of the following best explains the mechanism of liver damage in this patient?",
    explanation: "Chronic alcohol use leads to hepatocyte damage through multiple mechanisms including acetaldehyde toxicity, oxidative stress, and immune-mediated injury. The AST/ALT ratio >2 is characteristic of alcoholic liver disease because alcohol induces mitochondrial AST and damages hepatocyte mitochondria preferentially.",
    choices: [
      { id: "a", letter: "A", text: "Autoimmune destruction of bile ducts", is_correct: false, explanation: "This describes primary biliary cholangitis." },
      { id: "b", letter: "B", text: "Acetaldehyde-mediated hepatocyte injury", is_correct: true, explanation: "Correct! Acetaldehyde, the primary metabolite of ethanol, causes direct hepatocyte damage." },
      { id: "c", letter: "C", text: "Copper accumulation in hepatocytes", is_correct: false, explanation: "This describes Wilson disease." },
      { id: "d", letter: "D", text: "Iron deposition in liver parenchyma", is_correct: false, explanation: "This describes hemochromatosis." },
      { id: "e", letter: "E", text: "Viral-mediated hepatocyte apoptosis", is_correct: false, explanation: "This would be seen in viral hepatitis." },
    ],
  },
];

export default function ExamInterface() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(3600); // 60 min
  const [showNavigator, setShowNavigator] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = mockQuestions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (choiceId: string) => {
    if (showExplanation[currentIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: choiceId }));
  };

  const submitAnswer = useCallback(() => {
    if (selectedAnswers[currentIndex]) {
      setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));
    }
  }, [currentIndex, selectedAnswers]);

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const toggleMark = () => {
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const endExam = () => {
    setIsSubmitted(true);
  };

  const getChoiceStyle = (choice: typeof currentQuestion.choices[0]) => {
    const isSelected = selectedAnswers[currentIndex] === choice.id;
    const isRevealed = showExplanation[currentIndex];

    if (!isRevealed) {
      return isSelected
        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
        : "border-border hover:border-primary/40 hover:bg-muted/30";
    }

    if (choice.is_correct) {
      return "border-green-500 bg-green-50 ring-2 ring-green-200";
    }
    if (isSelected && !choice.is_correct) {
      return "border-destructive bg-red-50 ring-2 ring-red-200";
    }
    return "border-border opacity-60";
  };

  if (isSubmitted) {
    const correct = questions.filter(
      (q, i) => selectedAnswers[i] && q.choices.find((c) => c.id === selectedAnswers[i])?.is_correct
    ).length;
    const answered = Object.keys(selectedAnswers).length;

    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex h-12 items-center justify-between bg-[hsl(207,80%,35%)] px-4">
          <span className="text-sm font-semibold text-white">MedPrep - Test Results</span>
          <Button variant="ghost" size="sm" className="text-white hover:text-white/80" onClick={() => navigate("/dashboard")}>
            <X className="mr-1 h-4 w-4" /> Close
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md space-y-6 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Test Complete!</h1>
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">
                Score: <span className="font-bold text-foreground">{correct}/{totalQuestions}</span> ({Math.round((correct / totalQuestions) * 100)}%)
              </p>
              <p className="text-sm text-muted-foreground">
                Answered: {answered}/{totalQuestions} | Omitted: {totalQuestions - answered}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate("/dashboard/previous-tests")}>View All Tests</Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/create-test")}>Create New Test</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar - UWorld style */}
      <div className="flex h-11 items-center justify-between bg-[hsl(207,80%,35%)] px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-white">MedPrep</span>
          <span className="text-xs text-white/70">Block 1</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white">
            <Calculator className="h-3.5 w-3.5" /> Calculator
          </button>
          <button className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white">
            <FlaskConical className="h-3.5 w-3.5" /> Lab Values
          </button>
          <button
            onClick={toggleMark}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-white/10 ${
              markedQuestions.has(currentIndex) ? "text-yellow-300" : "text-white/80 hover:text-white"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" /> Mark
          </button>
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-white/10 ${
              flaggedQuestions.has(currentIndex) ? "text-red-400" : "text-white/80 hover:text-white"
            }`}
          >
            <Flag className="h-3.5 w-3.5" /> Flag
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-white/80">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-white hover:text-white/80"
            onClick={endExam}
          >
            End Block
          </Button>
        </div>
      </div>

      {/* Question area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Question header */}
          <div className="border-b bg-card px-6 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Question body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm leading-relaxed text-foreground">
                {currentQuestion.question_text}
              </p>

              {/* Answer choices */}
              <div className="space-y-2">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedAnswers[currentIndex] === choice.id;
                  const isRevealed = showExplanation[currentIndex];

                  return (
                    <button
                      key={choice.id}
                      onClick={() => selectAnswer(choice.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all ${getChoiceStyle(choice)}`}
                      disabled={isRevealed}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                          isSelected && !isRevealed
                            ? "border-primary bg-primary text-primary-foreground"
                            : isRevealed && choice.is_correct
                            ? "border-green-500 bg-green-500 text-white"
                            : isRevealed && isSelected && !choice.is_correct
                            ? "border-destructive bg-destructive text-white"
                            : "border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        {choice.letter}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-foreground">{choice.text}</span>
                        {isRevealed && isSelected && !choice.is_correct && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                            {choice.explanation}
                          </div>
                        )}
                        {isRevealed && choice.is_correct && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-green-700">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                            {choice.explanation}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation panel */}
              {showExplanation[currentIndex] && (
                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
                  <h3 className="mb-2 text-sm font-bold text-primary">Explanation</h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator sidebar */}
        {showNavigator && (
          <div className="w-56 shrink-0 border-l bg-card p-4 overflow-y-auto">
            <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase">Navigator</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const isAnswered = selectedAnswers[i] !== undefined;
                const isMarked = markedQuestions.has(i);
                const isFlagged = flaggedQuestions.has(i);
                const isCurrent = i === currentIndex;

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isAnswered
                        ? "bg-muted text-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                    {isMarked && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400" />
                    )}
                    {isFlagged && (
                      <span className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="flex h-12 items-center justify-between border-t bg-card px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevQuestion} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={nextQuestion} disabled={currentIndex === totalQuestions - 1}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!showExplanation[currentIndex] && selectedAnswers[currentIndex] && (
            <Button size="sm" onClick={submitAnswer}>
              Submit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNavigator(!showNavigator)}
          >
            {showNavigator ? "Hide" : "Show"} Navigator
          </Button>
        </div>
      </div>
    </div>
  );
}
