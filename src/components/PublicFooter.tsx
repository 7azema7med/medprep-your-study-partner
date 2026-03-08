import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t bg-card py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">MedPrep</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/features" className="hover:text-primary">Features</Link>
            <Link to="/pricing" className="hover:text-primary">Pricing</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MedPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
