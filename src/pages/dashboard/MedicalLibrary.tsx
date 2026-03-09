import { Link } from "react-router-dom";
import { 
  Menu, Maximize, Sun, Moon, Eye, Home, Search, Bookmark, 
  FileText, Folder, ArrowLeft, Settings, Highlighter, CheckCircle, 
  StickyNote, Zap, MessageCircle, Image as ImageIcon
} from "lucide-react";

export default function MedicalLibrary() {
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
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors">
              <FileText className="h-[18px] w-[18px] text-muted-foreground" />
              Welcome To The Medical Library
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[16px] text-foreground hover:bg-muted/50 transition-colors">
              <Folder className="h-[18px] w-[18px] text-muted-foreground" />
              Allergy & Immunology
            </button>
            
            {/* Selected Article Styling */}
            <div className="mt-1 flex flex-col">
              <div className="group flex w-full items-center justify-between rounded-md bg-muted/80 px-3 py-2.5 text-primary">
                <div className="flex items-center gap-3">
                  <FileText className="h-[18px] w-[18px]" />
                  <span className="text-[16px] font-medium">Acute Rheumatic Fever</span>
                </div>
                <Bookmark className="h-[18px] w-[18px] fill-primary" />
              </div>
              
              {/* Expanded Subsections */}
              <div className="ml-[26px] mt-1 flex flex-col border-l border-border py-1">
                {/* Active Section */}
                <button className="relative flex w-full items-center bg-muted/40 py-2 pl-4 text-[15px] font-medium text-primary">
                  <div className="absolute left-[-1px] top-0 h-full w-[2px] bg-primary" />
                  Introduction
                </button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Pathogenesis</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Risk Factors</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Clinical Presentation</button>
                
                {/* Nested Bullet Items */}
                <div className="flex flex-col py-1">
                  <button className="flex w-full items-center gap-3 py-1.5 pl-8 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                    <div className="h-[5px] w-[5px] rounded-full bg-muted-foreground" /> Major Criteria
                  </button>
                  <button className="flex w-full items-center gap-3 py-1.5 pl-8 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                    <div className="h-[5px] w-[5px] rounded-full bg-muted-foreground" /> Minor Criteria
                  </button>
                </div>
                
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Evaluation</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Diagnosis</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Differential Diagnosis</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Arthritis</button>
                <button className="flex w-full items-center py-2 pl-4 text-[15px] text-muted-foreground hover:text-foreground transition-colors">Carditis</button>
              </div>
            </div>
          </div>
        </aside>

        {/* Draggable divider hint (static for visual) */}
        <div className="w-[1px] cursor-col-resize bg-border hover:bg-primary transition-colors" />

        {/* 3. Main Content Panel */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto px-10 py-10 lg:px-20 lg:py-14">
            <div className="mx-auto max-w-[800px]">
              {/* Top Navigation */}
              <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to previous page
              </Link>

              {/* Article Title */}
              <h1 className="mb-4 text-[34px] font-bold tracking-tight text-foreground">
                Acute Rheumatic Fever
              </h1>
              
              {/* Category Tags */}
              <div className="mb-8 flex flex-wrap gap-2">
                {["Allergy & Immunology", "Infectious Diseases", "Cardiovascular System"].map((tag) => (
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
              <article className="prose prose-slate max-w-none text-[17px] leading-[1.7] text-foreground/90">
                <section className="mb-10">
                  <h2 className="mb-4 text-[19px] font-bold uppercase tracking-wider text-primary">
                    Introduction
                  </h2>
                  <p className="mb-4">
                    Acute rheumatic fever (ARF) is a delayed, nonsuppurative sequela of a pharyngeal infection with 
                    {" "}<i>Streptococcus</i> pyogenes (group A streptococcus [GAS]). It primarily affects children and 
                    adolescents, presenting with a constellation of clinical signs and symptoms.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="mb-4 text-[19px] font-bold uppercase tracking-wider text-primary">
                    Pathogenesis
                  </h2>
                  <p className="mb-4">
                    The pathogenesis involves an <strong>immune-mediated complication</strong> triggered by molecular mimicry. 
                    Antibodies directed against GAS antigens cross-react with human tissues, leading to widespread inflammation. 
                    This <strong>nonsuppurative</strong> immune response typically follows <strong>group A Streptococcus (GAS) pharyngitis</strong> after a latent period of 2 to 4 weeks.
                  </p>
                  <p className="mb-4">
                    The heart, joints, skin, and central nervous system are primarily affected, resulting in the classic manifestations of the disease.
                  </p>
                </section>
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
