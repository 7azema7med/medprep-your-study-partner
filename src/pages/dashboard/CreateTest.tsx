import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const subjects = [
  "Anatomy", "Biochemistry", "Physiology", "Pharmacology",
  "Pathology", "Microbiology", "Immunology", "Behavioral Science",
  "Biostatistics", "Genetics",
];

const modes = ["Timed", "Tutor", "Untimed"];

export default function CreateTest() {
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState("Timed");
  const [numQuestions, setNumQuestions] = useState("40");

  const toggleSubject = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Create Test</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Select Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {subjects.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-secondary">
                  <Checkbox
                    checked={selected.includes(s)}
                    onCheckedChange={() => toggleSubject(s)}
                  />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Test Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {modes.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{m}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Number of Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min={1}
                max={100}
              />
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" disabled={selected.length === 0}>
            Generate Test
          </Button>
        </div>
      </div>
    </div>
  );
}
