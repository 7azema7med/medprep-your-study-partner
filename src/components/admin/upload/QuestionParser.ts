export interface ParsedChoice {
  choice_letter: string;
  choice_text: string;
  is_correct: boolean;
  explanation: string;
}

export interface ParsedQuestion {
  question_text: string;
  explanation: string;
  difficulty: string;
  subject_id: string;
  choices: ParsedChoice[];
  _error?: string;
  _row?: number;
  _selected?: boolean;
}

export function parseQuestionsFromText(
  rawText: string,
  defaultDifficulty: string,
  defaultSubject: string
): ParsedQuestion[] {
  const blocks = rawText.split(/\n\s*\n/).filter(b => b.trim());
  const questions: ParsedQuestion[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].split("\n").map(l => l.trim()).filter(Boolean);
    const q: ParsedQuestion = {
      question_text: "",
      explanation: "",
      difficulty: defaultDifficulty,
      subject_id: defaultSubject,
      choices: [],
      _row: i + 1,
      _selected: true,
    };

    for (const line of lines) {
      if (line.startsWith("Q:") || line.startsWith("Q.")) {
        q.question_text = line.replace(/^Q[:.]?\s*/, "").trim();
      } else if (/^[A-F][:.)]\s/.test(line)) {
        const letter = line[0];
        const isCorrect = line.includes("*correct") || /\*\s*$/.test(line);
        const text = line
          .replace(/^[A-F][:.)]\s*/, "")
          .replace(/\s*\*correct\s*/g, "")
          .replace(/\s*\*\s*$/g, "")
          .trim();
        q.choices.push({ choice_letter: letter, choice_text: text, is_correct: isCorrect, explanation: "" });
      } else if (line.toLowerCase().startsWith("explanation:")) {
        q.explanation = line.replace(/^explanation:\s*/i, "").trim();
      } else if (line.toLowerCase().startsWith("difficulty:")) {
        q.difficulty = line.replace(/^difficulty:\s*/i, "").trim().toLowerCase();
      } else if (!q.question_text) {
        q.question_text = line;
      }
    }

    if (!q.question_text) q._error = "Missing question text";
    else if (q.choices.length < 2) q._error = "Need at least 2 choices";
    else if (!q.choices.some(c => c.is_correct)) q._error = "No correct answer marked";

    questions.push(q);
  }

  return questions;
}
