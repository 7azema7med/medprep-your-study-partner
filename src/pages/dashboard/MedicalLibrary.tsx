import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { useState } from "react";

const libraryCategories = [
  {
    category: "Cardiovascular",
    icon: "❤️",
    items: [
      { title: "Heart Failure", desc: "Classification, pathophysiology, management" },
      { title: "Arrhythmias", desc: "ECG interpretation, types, treatment" },
      { title: "Valvular Heart Disease", desc: "Stenosis, regurgitation, prosthetic valves" },
      { title: "Coronary Artery Disease", desc: "Angina, MI, revascularization" },
      { title: "Hypertension", desc: "Classification, treatment algorithms" },
      { title: "Congenital Heart Disease", desc: "ASD, VSD, PDA, Tetralogy of Fallot" },
    ],
  },
  {
    category: "Respiratory",
    icon: "🫁",
    items: [
      { title: "Asthma", desc: "Pathophysiology, stepwise therapy" },
      { title: "COPD", desc: "Emphysema, chronic bronchitis, GOLD criteria" },
      { title: "Pneumonia", desc: "Community-acquired, hospital-acquired, atypical" },
      { title: "Pulmonary Embolism", desc: "Diagnosis, Wells criteria, treatment" },
      { title: "Lung Cancer", desc: "Staging, types, targeted therapy" },
    ],
  },
  {
    category: "Gastrointestinal",
    icon: "🫀",
    items: [
      { title: "GERD", desc: "Diagnosis, lifestyle changes, PPIs" },
      { title: "Peptic Ulcer Disease", desc: "H. pylori, NSAIDs, triple therapy" },
      { title: "IBD", desc: "Crohn's vs UC, treatment, complications" },
      { title: "Liver Cirrhosis", desc: "Etiology, complications, Child-Pugh" },
      { title: "Pancreatitis", desc: "Acute vs chronic, Ranson criteria" },
    ],
  },
  {
    category: "Endocrine",
    icon: "🧬",
    items: [
      { title: "Diabetes Mellitus", desc: "Type 1, Type 2, DKA, HHS" },
      { title: "Thyroid Disorders", desc: "Hypo/hyperthyroidism, nodules" },
      { title: "Adrenal Disorders", desc: "Cushing, Addison, pheochromocytoma" },
      { title: "Pituitary Disorders", desc: "Acromegaly, prolactinoma, SIADH" },
    ],
  },
  {
    category: "Neurology",
    icon: "🧠",
    items: [
      { title: "Stroke", desc: "Ischemic vs hemorrhagic, tPA criteria" },
      { title: "Epilepsy", desc: "Seizure types, AEDs, status epilepticus" },
      { title: "Multiple Sclerosis", desc: "Types, diagnosis, DMTs" },
      { title: "Parkinson's Disease", desc: "Pathology, levodopa, complications" },
      { title: "Meningitis", desc: "Bacterial vs viral, CSF analysis" },
    ],
  },
  {
    category: "Renal",
    icon: "🫘",
    items: [
      { title: "Acute Kidney Injury", desc: "Pre-renal, intrinsic, post-renal" },
      { title: "CKD", desc: "Staging, complications, dialysis" },
      { title: "Glomerulonephritis", desc: "Nephritic vs nephrotic, biopsy" },
      { title: "Acid-Base Disorders", desc: "Metabolic/respiratory, compensation" },
    ],
  },
  {
    category: "Hematology",
    icon: "🩸",
    items: [
      { title: "Anemia", desc: "Iron deficiency, B12, folate, hemolytic" },
      { title: "Coagulation Disorders", desc: "DIC, hemophilia, VWD" },
      { title: "Leukemia", desc: "ALL, AML, CLL, CML" },
      { title: "Lymphoma", desc: "Hodgkin vs non-Hodgkin" },
    ],
  },
  {
    category: "Infectious Disease",
    icon: "🦠",
    items: [
      { title: "HIV/AIDS", desc: "Staging, opportunistic infections, ART" },
      { title: "Tuberculosis", desc: "Primary, reactivation, RIPE therapy" },
      { title: "STIs", desc: "Chlamydia, gonorrhea, syphilis, HSV" },
      { title: "Fungal Infections", desc: "Candida, Aspergillus, antifungals" },
    ],
  },
];

export default function MedicalLibrary() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = query.trim()
    ? libraryCategories
        .map((c) => ({
          ...c,
          items: c.items.filter(
            (i) =>
              i.title.toLowerCase().includes(query.toLowerCase()) ||
              i.desc.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((c) => c.items.length > 0)
    : libraryCategories;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">Medical Library</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search topics..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((cat) => (
          <Card
            key={cat.category}
            className={`cursor-pointer transition-all hover:shadow-md ${expanded === cat.category ? "ring-1 ring-primary/30 col-span-full" : ""}`}
            onClick={() => setExpanded(expanded === cat.category ? null : cat.category)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="text-lg">{cat.icon}</span>
                {cat.category}
                <Badge variant="secondary" className="ml-auto text-[10px]">{cat.items.length} topics</Badge>
              </CardTitle>
            </CardHeader>
            {(expanded === cat.category || query.trim()) && (
              <CardContent>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.title} className="flex items-center gap-2 rounded-md border p-2.5 hover:bg-muted/30 transition-colors">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
