import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { labValuesData } from "@/lib/lab-values-data";
import { useExamStore } from "@/stores/exam-store";
import { Search } from "lucide-react";

export default function LabValuesDialog() {
  const { activeDialog, setActiveDialog } = useExamStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(labValuesData[0]?.id || "");

  const open = activeDialog === "lab";

  const filteredData = search.trim()
    ? labValuesData
        .map((cat) => ({
          ...cat,
          values: cat.values.filter((v) =>
            v.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.values.length > 0)
    : labValuesData.filter((cat) => cat.id === activeCategory);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Lab Values Reference</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lab values..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden border-t">
          {/* Category tabs */}
          {!search.trim() && (
            <ScrollArea className="w-44 shrink-0 border-r">
              <div className="py-1">
                {labValuesData.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                      activeCategory === cat.id
                        ? "bg-[hsl(var(--sidebar-bg))] text-white font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Values table */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {filteredData.map((cat) => (
                <div key={cat.id} className="mb-4">
                  {search.trim() && (
                    <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{cat.name}</h3>
                  )}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-1 text-left font-semibold text-muted-foreground">Test</th>
                        <th className="pb-1 text-left font-semibold text-muted-foreground">Unit</th>
                        <th className="pb-1 text-left font-semibold text-muted-foreground">Reference Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.values.map((v, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5 pr-4 font-medium text-foreground">{v.name}</td>
                          <td className="py-1.5 pr-4 text-muted-foreground">{v.unit}</td>
                          <td className="py-1.5 text-foreground">{v.reference_range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
