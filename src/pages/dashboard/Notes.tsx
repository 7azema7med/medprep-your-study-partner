import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";

const noteCategories = [
  { category: "Subjects", items: [
    { title: "Anatomy", count: 12, color: "bg-blue-500" },
    { title: "Physiology", count: 18, color: "bg-green-500" },
    { title: "Pharmacology", count: 15, color: "bg-purple-500" },
    { title: "Pathology", count: 20, color: "bg-red-500" },
    { title: "Biochemistry", count: 10, color: "bg-amber-500" },
    { title: "Microbiology", count: 8, color: "bg-teal-500" },
  ]},
  { category: "Systems", items: [
    { title: "Cardiovascular", count: 14, color: "bg-rose-500" },
    { title: "Respiratory", count: 11, color: "bg-sky-500" },
    { title: "Gastrointestinal", count: 9, color: "bg-orange-500" },
    { title: "Nervous System", count: 16, color: "bg-indigo-500" },
    { title: "Renal", count: 7, color: "bg-cyan-500" },
    { title: "Endocrine", count: 13, color: "bg-violet-500" },
  ]},
];

const sampleNotes = [
  { id: 1, title: "Cardiac Cycle Phases", category: "Physiology", preview: "The cardiac cycle consists of systole (contraction) and diastole (relaxation). During systole, the ventricles contract...", favorite: true },
  { id: 2, title: "Beta-Lactam Antibiotics", category: "Pharmacology", preview: "Beta-lactams inhibit cell wall synthesis by binding to penicillin-binding proteins (PBPs)...", favorite: false },
  { id: 3, title: "Nephron Function", category: "Physiology", preview: "The nephron is the functional unit of the kidney. It consists of the glomerulus, proximal tubule...", favorite: true },
  { id: 4, title: "Inflammatory Mediators", category: "Pathology", preview: "Key mediators include histamine (vasodilation, increased permeability), prostaglandins (pain, fever)...", favorite: false },
  { id: 5, title: "Autosomal Dominant Disorders", category: "Genetics", preview: "Common autosomal dominant disorders: Marfan syndrome, Huntington disease, familial hypercholesterolemia...", favorite: false },
  { id: 6, title: "Krebs Cycle", category: "Biochemistry", preview: "The citric acid cycle (TCA cycle) occurs in the mitochondrial matrix. Acetyl-CoA enters by combining with oxaloacetate...", favorite: true },
];

export default function Notes() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredNotes = sampleNotes.filter((n) => {
    const matchesQuery = !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.preview.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !activeCategory || n.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Notes</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search notes..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Category cards */}
      {noteCategories.map((group) => (
        <div key={group.category}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group.category}</h2>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
            {group.items.map((item) => (
              <button
                key={item.title}
                onClick={() => setActiveCategory(activeCategory === item.title ? null : item.title)}
                className={`rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
                  activeCategory === item.title ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card"
                }`}
              >
                <div className={`h-1.5 w-8 rounded-full ${item.color} mb-2`} />
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.count} notes</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Notes list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {activeCategory ? `${activeCategory} Notes` : "All Notes"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((n) => (
            <Card key={n.id} className="cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold">{n.title}</CardTitle>
                  <Star className={`h-4 w-4 shrink-0 ${n.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                </div>
                <Badge variant="secondary" className="w-fit text-[10px]">{n.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-3">{n.preview}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredNotes.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No notes found.</div>
        )}
      </div>
    </div>
  );
}
