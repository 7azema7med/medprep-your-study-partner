import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const topics = [
  { category: "Cardiovascular", items: ["Heart Failure", "Arrhythmias", "Valvular Diseases", "Coronary Artery Disease"] },
  { category: "Respiratory", items: ["Asthma", "COPD", "Pneumonia", "Pulmonary Embolism"] },
  { category: "Gastrointestinal", items: ["GERD", "Peptic Ulcer Disease", "Inflammatory Bowel Disease", "Liver Cirrhosis"] },
  { category: "Endocrine", items: ["Diabetes Mellitus", "Thyroid Disorders", "Adrenal Disorders", "Pituitary Disorders"] },
  { category: "Neurology", items: ["Stroke", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease"] },
  { category: "Renal", items: ["Acute Kidney Injury", "Chronic Kidney Disease", "Glomerulonephritis", "Nephrotic Syndrome"] },
];

export default function MedicalLibrary() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Medical Library</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Card key={t.category} className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                {t.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {t.items.map((item) => (
                  <li key={item} className="cursor-pointer text-sm text-muted-foreground hover:text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
