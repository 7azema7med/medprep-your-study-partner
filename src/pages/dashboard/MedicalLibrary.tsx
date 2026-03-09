import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, Maximize, Sun, Moon, Eye, Home, Search, Bookmark, 
  FileText, Folder, ArrowLeft, Settings, Highlighter, CheckCircle, 
  StickyNote, Zap, MessageCircle, Image as ImageIcon, ChevronDown, ChevronRight
} from "lucide-react";

// --- Mock Data Types & Data ---

type Section = {
  id: string;
  title: string;
  level: number;
  content: React.ReactNode;
};

type Article = {
  id: string;
  title: string;
  tags: string[];
  sections: Section[];
};

type Category = {
  id: string;
  title: string;
  icon: any;
  articles: Article[];
};

const libraryData: Category[] = [
  {
    id: "allergy-immunology",
    title: "Allergy & Immunology",
    icon: Folder,
    articles: [
      {
        id: "acute-rheumatic-fever",
        title: "Acute Rheumatic Fever",
        tags: ["Allergy & Immunology", "Infectious Diseases", "Cardiovascular System"],
        sections: [
          {
            id: "introduction",
            title: "Introduction",
            level: 1,
            content: (
              <p className="mb-4">
                Acute rheumatic fever (ARF) is a delayed, nonsuppurative sequela of a pharyngeal infection with 
                {" "}<i>Streptococcus</i> pyogenes (group A streptococcus [GAS]). It primarily affects children and 
                adolescents, presenting with a constellation of clinical signs and symptoms.
              </p>
            )
          },
          {
            id: "pathogenesis",
            title: "Pathogenesis",
            level: 1,
            content: (
              <>
                <p className="mb-4">
                  The pathogenesis involves an <strong>immune-mediated complication</strong> triggered by molecular mimicry. 
                  Antibodies directed against GAS antigens cross-react with human tissues, leading to widespread inflammation. 
                  This <strong>nonsuppurative</strong> immune response typically follows <strong>group A Streptococcus (GAS) pharyngitis</strong> after a latent period of 2 to 4 weeks.
                </p>
                <p className="mb-4">
                  The heart, joints, skin, and central nervous system are primarily affected, resulting in the classic manifestations of the disease.
                </p>
              </>
            )
          },
          {
            id: "risk-factors",
            title: "Risk Factors",
            level: 1,
            content: (
              <ul className="mb-4 list-inside list-disc space-y-2">
                <li>Age: 5-15 years old (most common demographic)</li>
                <li>Crowded living conditions (facilitates transmission of GAS)</li>
                <li>Lack of access to regular healthcare and antibiotics</li>
                <li>Genetic predisposition to immune hyperreactivity</li>
              </ul>
            )
          },
          {
            id: "clinical-presentation",
            title: "Clinical Presentation",
            level: 1,
            content: (
              <p className="mb-4">
                The clinical presentation is highly variable. Symptoms usually emerge 2-4 weeks following an untreated GAS infection. The diagnosis is classically based on the Jones Criteria, which divides features into major and minor manifestations.
              </p>
            )
          },
          {
            id: "major-criteria",
            title: "Major Criteria",
            level: 2,
            content: (
              <ul className="mb-4 list-inside list-disc space-y-2">
                <li><strong>Carditis:</strong> Can involve all three layers of the heart (pancarditis). The mitral valve is most commonly affected, leading to regurgitation.</li>
                <li><strong>Polyarthritis:</strong> Typically migratory, affecting large joints (knees, ankles, wrists, elbows) sequentially.</li>
                <li><strong>Sydenham chorea:</strong> Involuntary, purposeless movements, often accompanied by emotional lability and muscle weakness.</li>
                <li><strong>Erythema marginatum:</strong> Evanescent, non-pruritic macular rash with pale centers and rounded margins.</li>
                <li><strong>Subcutaneous nodules:</strong> Firm, painless nodules found over extensor surfaces of joints and the spine.</li>
              </ul>
            )
          },
          {
            id: "minor-criteria",
            title: "Minor Criteria",
            level: 2,
            content: (
              <ul className="mb-4 list-inside list-disc space-y-2">
                <li>Polyarthralgia (if polyarthritis is not counted as a major criterion)</li>
                <li>Fever (≥38.5°C)</li>
                <li>Elevated acute phase reactants (ESR ≥60 mm/h or CRP ≥3.0 mg/dL)</li>
                <li>Prolonged PR interval on electrocardiogram (ECG)</li>
              </ul>
            )
          },
          {
            id: "evaluation",
            title: "Evaluation",
            level: 1,
            content: (
              <p className="mb-4">
                Evaluation requires evidence of preceding GAS infection (e.g., positive throat culture, rapid antigen test, or elevated/rising streptococcal antibody titers like ASO or anti-DNase B) in addition to applying the Jones Criteria. Echocardiography is critical for evaluating subclinical carditis in all suspected cases.
              </p>
            )
          },
          {
            id: "diagnosis",
            title: "Diagnosis",
            level: 1,
            content: (
              <p className="mb-4">
                Diagnosis of initial ARF requires evidence of preceding GAS infection plus either 2 major criteria OR 1 major + 2 minor criteria. For recurrent ARF, 3 minor criteria may also suffice.
              </p>
            )
          },
          {
            id: "differential-diagnosis",
            title: "Differential Diagnosis",
            level: 1,
            content: (
              <ul className="mb-4 list-inside list-disc space-y-2">
                <li>Post-streptococcal reactive arthritis (PSRA)</li>
                <li>Juvenile idiopathic arthritis (JIA)</li>
                <li>Systemic lupus erythematosus (SLE)</li>
                <li>Infective endocarditis</li>
                <li>Lyme disease</li>
              </ul>
            )
          },
        ]
      },
      {
        id: "anaphylaxis",
        title: "Anaphylaxis",
        tags: ["Allergy & Immunology", "Emergency Medicine"],
        sections: [
          {
            id: "ana-intro",
            title: "Introduction",
            level: 1,
            content: <p className="mb-4">Anaphylaxis is a severe, potentially life-threatening systemic hypersensitivity reaction that can occur rapidly after contact with an allergen.</p>
          },
          {
            id: "ana-triggers",
            title: "Common Triggers",
            level: 1,
            content: <p className="mb-4">Food (peanuts, tree nuts, shellfish), medications (penicillin), insect stings, and latex are the most common triggers for anaphylaxis.</p>
          }
        ]
      }
    ]
  },
  {
    id: "cardiovascular-system",
    title: "Cardiovascular System",
    icon: Folder,
    articles: [
      {
        id: "heart-failure",
        title: "Heart Failure",
        tags: ["Cardiology", "Internal Medicine"],
        sections: [
          {
            id: "hf-intro",
            title: "Introduction",
            level: 1,
            content: <p className="mb-4">Heart failure is a complex clinical syndrome resulting from structural or functional impairment of ventricular filling or ejection of blood.</p>
          },
          {
            id: "hf-patho",
            title: "Pathophysiology",
            level: 1,
            content: <p className="mb-4">It involves a variety of compensatory mechanisms including RAAS activation and sympathetic nervous system stimulation, which eventually become maladaptive and worsen the failure.</p>
          }
        ]
      }
    ]
  }
];

export default function MedicalLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['allergy-immunology']);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('acute-rheumatic-fever');
  const [activeSectionId, setActiveSectionId] = useState<string>('introduction');

  // Filter Data based on search
  const filteredLibraryData = libraryData.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || category.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery) {
      setExpandedCategories(filteredLibraryData.map(c => c.id));
    }
  }, [searchQuery]);

  const selectedArticle = libraryData
    .flatMap(c => c.articles)
    .find(a => a.id === selectedArticleId) || libraryData[0].articles[0];

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    const container = document.getElementById('article-scroll-container');
    
    if (element && container) {
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      container.scrollBy({
        top: elementTop - containerTop - 20, 
        behavior: 'smooth'
      });
    }
  };

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const container = document.getElementById('article-scroll-container');
    if (!container || !selectedArticle) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting element
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSectionId(visibleEntries[0].target.id.replace('section-', ''));
        }
      },
      { 
        root: container,
        rootMargin: '-10% 0px -70% 0px' 
      }
    );

    selectedArticle.sections.forEach(section => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selectedArticle]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
      {/* 1. Top Header Bar */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-[22px] font-medium text-foreground">Medical Library</h1>
        </div>
        <div className="flex items-center gap-6 text-muted-foreground">
          <button className="hover:text-foreground transition-colors"><Maximize className="h-5 w-5 stroke-[1.5]" /></button>
          <button className="hover:text-foreground transition-colors"><Sun className="h-5 w-5 stroke-[1.5]" /></button>
          <button className="hover:text-foreground transition-colors"><Moon className="h-5 w-5 stroke-[1.5]" /></button>
          <button className="hover:text-foreground transition-colors"><Eye className="h-5 w-5 stroke-[1.5]" /></button>
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Home className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[15px] font-medium">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2. Left Sidebar Navigation */}
        <aside className="flex w-[32%] min-w-[280px] max-w-[400px] shrink-0 flex-col border-r border-border bg-muted/20">
          {/* A. Search Field */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Medical Library" 
                className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          {/* B. Bookmarks Row */}
          <button className="flex items-center gap-3 px-5 py-3 text-[16px] text-foreground hover:bg-muted/50 transition-colors">
            <Bookmark className="h-[18px] w-[18px] text-muted-foreground" />
            Bookmarks
          </button>
          
          {/* C. Divider */}
          <div className="mx-4 my-1 border-t border-border" />

          {/* D. Navigation Tree */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors">
              <FileText className="h-[18px] w-[18px] text-muted-foreground" />
              Welcome To The Medical Library
            </button>
            
            {filteredLibraryData.map(category => (
              <div key={category.id} className="mt-1 flex flex-col">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors"
                >
                  <category.icon className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="flex-1 text-left">{category.title}</span>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {/* Expanded Articles */}
                {expandedCategories.includes(category.id) && (
                  <div className="mt-1 flex flex-col space-y-1">
                    {category.articles.map(article => {
                      const isSelected = selectedArticleId === article.id;
                      
                      return (
                        <div key={article.id} className="flex flex-col">
                          {/* Article Title */}
                          <div 
                            onClick={() => {
                              setSelectedArticleId(article.id);
                              if (article.sections.length > 0) {
                                setActiveSectionId(article.sections[0].id);
                                document.getElementById('article-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={`group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 transition-colors ${
                              isSelected ? "bg-muted/80 text-primary" : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className={`h-[18px] w-[18px] ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`text-[16px] ${isSelected ? "font-medium" : ""}`}>{article.title}</span>
                            </div>
                            {isSelected && <Bookmark className="h-[18px] w-[18px] fill-primary" />}
                          </div>
                          
                          {/* Sections */}
                          {isSelected && (
                            <div className="ml-[26px] mt-1 flex flex-col border-l border-border py-1">
                              {article.sections.map(section => {
                                const isActive = activeSectionId === section.id;
                                
                                if (section.level === 1) {
                                  return (
                                    <button 
                                      key={section.id}
                                      onClick={() => scrollToSection(section.id)}
                                      className={`relative flex w-full items-center py-2 pl-4 text-[15px] text-left transition-colors ${
                                        isActive ? "bg-muted/40 font-medium text-primary" : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {isActive && <div className="absolute left-[-1px] top-0 h-full w-[2px] bg-primary" />}
                                      {section.title}
                                    </button>
                                  );
                                } else {
                                  return (
                                    <div key={section.id} className="flex flex-col py-1">
                                      <button 
                                        onClick={() => scrollToSection(section.id)}
                                        className={`flex w-full items-center gap-3 py-1.5 pl-8 text-[14px] text-left transition-colors ${
                                          isActive ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                      >
                                        <div className={`h-[5px] w-[5px] rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground"}`} /> 
                                        {section.title}
                                      </button>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Draggable divider hint (static for visual) */}
        <div className="w-[1px] cursor-col-resize bg-border hover:bg-primary transition-colors" />

        {/* 3. Main Content Panel */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
          <div id="article-scroll-container" className="flex-1 overflow-y-auto px-10 py-10 lg:px-20 lg:py-14 scroll-smooth">
            <div className="mx-auto max-w-[800px] pb-32">
              {/* Top Navigation */}
              <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to previous page
              </Link>

              {/* Article Title */}
              <h1 className="mb-4 text-[34px] font-bold tracking-tight text-foreground">
                {selectedArticle.title}
              </h1>
              
              {/* Category Tags */}
              <div className="mb-8 flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border bg-muted/20 px-4 py-1.5 text-[13px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 4. Article Toolbar */}
              <div className="mb-10 flex items-center gap-6 border-b border-border pb-4">
                <button className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Highlighter className="h-[18px] w-[18px]" />
                  Hide Highlights
                </button>
                <button className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <CheckCircle className="h-[18px] w-[18px]" />
                  Mark as Read
                </button>
                <button className="ml-auto flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="h-[18px] w-[18px]" />
                </button>
              </div>

              {/* 5. Article Body */}
              <article className="max-w-none text-[17px] leading-[1.7] text-foreground/90">
                {selectedArticle.sections.map(section => (
                  <section key={section.id} id={`section-${section.id}`} className="mb-10 scroll-mt-6">
                    {section.level === 1 ? (
                      <h2 className="mb-4 text-[19px] font-bold uppercase tracking-wider text-primary">
                        {section.title}
                      </h2>
                    ) : (
                      <h3 className="mb-4 text-[17px] font-bold text-foreground">
                        {section.title}
                      </h3>
                    )}
                    <div className="text-[17px] leading-[1.7] text-foreground/90">
                      {section.content}
                    </div>
                  </section>
                ))}
              </article>
            </div>
          </div>

          {/* 6. Bottom Utility Bar */}
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-8 rounded-full border border-border bg-background px-8 py-3 shadow-sm">
            <button className="text-muted-foreground hover:text-primary transition-colors"><StickyNote className="h-[22px] w-[22px] stroke-[1.5]" /></button>
            <button className="text-muted-foreground hover:text-primary transition-colors"><Zap className="h-[22px] w-[22px] stroke-[1.5]" /></button>
            <button className="text-muted-foreground hover:text-primary transition-colors"><MessageCircle className="h-[22px] w-[22px] stroke-[1.5]" /></button>
            <button className="text-muted-foreground hover:text-primary transition-colors"><Bookmark className="h-[22px] w-[22px] stroke-[1.5]" /></button>
            <button className="text-muted-foreground hover:text-primary transition-colors"><ImageIcon className="h-[22px] w-[22px] stroke-[1.5]" /></button>
          </div>
        </main>
      </div>

      {/* 7. Footer */}
      <footer className="shrink-0 border-t border-border bg-background py-3 text-center text-[13px] text-muted-foreground">
        Copyright © Coursology. All rights reserved
      </footer>
    </div>
  );
}
