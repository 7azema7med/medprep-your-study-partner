import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "How to Use", to: "/how-to-use" },
  ],
  Company: [
    { label: "Why Us", to: "/why-us" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
  ],
};

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MedPrep</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The professional medical question bank and study platform built for serious learners.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MedPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
