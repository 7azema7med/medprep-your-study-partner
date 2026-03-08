import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notes = [
  { id: 1, title: "Cardiac Cycle", subject: "Physiology", preview: "The cardiac cycle consists of systole and diastole..." },
  { id: 2, title: "Antimicrobial Mechanisms", subject: "Pharmacology", preview: "Beta-lactams work by inhibiting cell wall synthesis..." },
  { id: 3, title: "Renal Physiology", subject: "Physiology", preview: "The nephron is the functional unit of the kidney..." },
  { id: 4, title: "Inflammatory Mediators", subject: "Pathology", preview: "Histamine, prostaglandins, and leukotrienes are key..." },
  { id: 5, title: "Genetic Disorders", subject: "Genetics", preview: "Autosomal dominant disorders include Marfan syndrome..." },
];

export default function Notes() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Notes</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((n) => (
          <Card key={n.id} className="cursor-pointer shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{n.title}</CardTitle>
                <Badge variant="secondary">{n.subject}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{n.preview}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
