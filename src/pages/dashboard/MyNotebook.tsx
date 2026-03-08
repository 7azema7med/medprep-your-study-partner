import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
}

export default function MyNotebook() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: "Study Plan Week 1", content: "Focus on Cardiovascular and Respiratory systems..." },
    { id: 2, title: "Key Drug Interactions", content: "Warfarin + NSAIDs = increased bleeding risk..." },
  ]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const addNote = () => {
    if (!title.trim()) return;
    setNotes((prev) => [...prev, { id: Date.now(), title, content }]);
    setTitle("");
    setContent("");
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">My Notebook</h1>

      <Card className="mb-6 shadow-card">
        <CardContent className="space-y-3 pt-6">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button onClick={addNote} disabled={!title.trim()}>
            <Plus className="mr-1 h-4 w-4" /> Add Note
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notes.map((n) => (
          <Card key={n.id} className="shadow-card">
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div>
                <h3 className="font-semibold">{n.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{n.content}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteNote(n.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
