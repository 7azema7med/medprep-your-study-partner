import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Minus, Menu, X, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SubSystem { id: string; name: string; description?: string; }
interface System { id: string; name: string; description?: string; subsystems: SubSystem[]; }
interface Subject { id: string; name: string; description?: string; systems: System[]; }

export default function BrowseContent() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for expanded subjects and systems
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
  
  // State for selection
  const [selectedItem, setSelectedItem] = useState<{type: 'subject' | 'system' | 'subsystem', data: any} | null>(null);
  
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [subsRes, sysRes, subSysRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('is_active', true),
        supabase.from('systems').select('*').eq('is_active', true),
        supabase.from('subsystems').select('*').eq('is_active', true)
      ]);

      const rawSubjects = subsRes.data || [];
      const rawSystems = sysRes.data || [];
      const rawSubSystems = subSysRes.data || [];

      // Build hierarchy
      const builtSubjects: Subject[] = rawSubjects.map(sub => {
        const sysForSub = rawSystems.filter(s => s.subject_id === sub.id);
        const builtSystems: System[] = sysForSub.map(sys => {
          const subSysForSys = rawSubSystems.filter(ss => ss.system_id === sys.id);
          return {
            id: sys.id,
            name: sys.name,
            description: sys.description,
            subsystems: subSysForSys
          };
        });
        return {
          id: sub.id,
          name: sub.name,
          description: sub.description,
          systems: builtSystems
        };
      });

      setSubjects(builtSubjects);
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSystem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSystems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (type: 'subject' | 'system' | 'subsystem', data: any) => {
    setSelectedItem({ type, data });
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-5 relative overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-card border-r shadow-xl transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-[35%] md:min-w-[280px] md:max-w-[400px] md:shadow-none flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Browse Topics
          </h2>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No subjects found.</p>
          ) : (
            subjects.map(subject => (
              <div key={subject.id} className="space-y-1">
                <div 
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect('subject', subject)}
                  aria-expanded={expandedSubjects.has(subject.id)}
                  className={`
                    flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors group
                    ${selectedItem?.data.id === subject.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}
                  `}
                  onClick={() => handleSelect('subject', subject)}
                >
                  <button 
                    onClick={(e) => toggleSubject(subject.id, e)}
                    className="p-1 rounded-md hover:bg-background/80 transition-transform group-hover:scale-110"
                    aria-label={expandedSubjects.has(subject.id) ? "Collapse subject" : "Expand subject"}
                  >
                    {expandedSubjects.has(subject.id) ? (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className="flex-1 select-none">{subject.name}</span>
                </div>

                <AnimatePresence>
                  {expandedSubjects.has(subject.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 pl-2 border-l space-y-1 overflow-hidden"
                    >
                      {subject.systems.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1 pl-2">No systems available</p>
                      ) : (
                        subject.systems.map(system => (
                          <div key={system.id} className="space-y-1">
                            <div 
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && handleSelect('system', system)}
                              aria-expanded={expandedSystems.has(system.id)}
                              className={`
                                flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group
                                ${selectedItem?.data.id === system.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/90'}
                              `}
                              onClick={() => handleSelect('system', system)}
                            >
                              <button 
                                onClick={(e) => toggleSystem(system.id, e)}
                                className="p-0.5 rounded-md hover:bg-background/80 transition-transform group-hover:scale-110"
                                aria-label={expandedSystems.has(system.id) ? "Collapse system" : "Expand system"}
                              >
                                {expandedSystems.has(system.id) ? (
                                  <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </button>
                              <span className="flex-1 text-sm select-none">{system.name}</span>
                            </div>

                            <AnimatePresence>
                              {expandedSystems.has(system.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-5 pl-2 border-l space-y-1 overflow-hidden"
                                >
                                  {system.subsystems.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-1 pl-2">No subsystems</p>
                                  ) : (
                                    system.subsystems.map(subsystem => (
                                      <div 
                                        key={subsystem.id}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSelect('subsystem', subsystem)}
                                        className={`
                                          p-1.5 pl-3 rounded-md cursor-pointer text-sm transition-colors
                                          ${selectedItem?.data.id === subsystem.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/80'}
                                        `}
                                        onClick={() => handleSelect('subsystem', subsystem)}
                                      >
                                        <span className="select-none">{subsystem.name}</span>
                                      </div>
                                    ))
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile Header Trigger */}
        <div className="md:hidden p-4 border-b flex items-center bg-card shadow-sm z-10">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span>Browse Topics</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {selectedItem ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedItem.data.id}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4 capitalize">
                  {selectedItem.type}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{selectedItem.data.name}</h1>
                {selectedItem.data.description && (
                  <p className="mt-3 text-muted-foreground text-lg leading-relaxed">{selectedItem.data.description}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-primary" />
                    Overview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Content related to {selectedItem.data.name} goes here. This section updates dynamically as you navigate the sidebar.
                  </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Study Material
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access articles, questions, and notes specific to this {selectedItem.type}.
                  </p>
                  <Button className="w-full transition-transform hover:scale-[1.02]" variant="default">Start Learning</Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Layers className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Select a Topic</h2>
              <p className="text-muted-foreground leading-relaxed">
                Use the sidebar to explore subjects, systems, and subsystems. Click on any topic to view its content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
