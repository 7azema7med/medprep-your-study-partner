import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SAMPLE_FORMAT = `Q: A 45-year-old male presents with chest pain radiating to the left arm. ECG shows ST elevation in leads II, III, aVF. What is the most likely diagnosis?
A: Inferior myocardial infarction *correct
B: Anterior myocardial infarction
C: Pericarditis
D: Pulmonary embolism
E: Aortic dissection
Explanation: ST elevation in leads II, III, aVF indicates inferior MI, typically caused by right coronary artery occlusion.
Difficulty: medium

Q: Which enzyme is the most specific marker for myocardial injury?
A: Creatine kinase MB
B: Troponin I *correct
C: Lactate dehydrogenase
D: Aspartate aminotransferase
Explanation: Troponin I is the most specific and sensitive biomarker for myocardial injury.
Difficulty: easy`;

export { SAMPLE_FORMAT };

export function FormatGuide() {
  const copyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_FORMAT);
    toast.success("Template copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Import Format Guide
            </CardTitle>
            <CardDescription>Paste questions in this plain-text format. Separate each question with a blank line.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={copyTemplate}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />Copy Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap font-mono border border-border">
          {SAMPLE_FORMAT}
        </pre>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Required Fields</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Start question with <code className="bg-muted px-1 rounded text-xs">Q:</code></li>
              <li>Choices: <code className="bg-muted px-1 rounded text-xs">A:</code> through <code className="bg-muted px-1 rounded text-xs">F:</code></li>
              <li>Mark correct with <code className="bg-muted px-1 rounded text-xs">*correct</code> or <code className="bg-muted px-1 rounded text-xs">*</code></li>
              <li>Minimum 2 choices, at least 1 correct</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Optional Fields</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-muted px-1 rounded text-xs">Explanation:</code> — answer rationale</li>
              <li><code className="bg-muted px-1 rounded text-xs">Difficulty: easy|medium|hard</code></li>
              <li>Separate questions with a blank line</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
          <p className="font-medium text-foreground mb-1">💡 Tips for bulk import</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
            <li>You can paste hundreds of questions at once</li>
            <li>Set default subject and difficulty before parsing to apply to all questions</li>
            <li>Use the preview tab to review and deselect any questions before importing</li>
            <li>Questions with errors are automatically excluded from import</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
