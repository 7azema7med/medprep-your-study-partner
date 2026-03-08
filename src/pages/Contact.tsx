import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageTransition, FadeIn } from "@/components/motion";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setSending(false);
    }, 1000);
  };

  return (
    <PublicLayout>
      <PageTransition>
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto mb-12 max-w-xl text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight">Contact Us</h1>
              <p className="text-sm text-muted-foreground">Have questions? We'd love to hear from you.</p>
            </FadeIn>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <FadeIn delay={0.1}>
                <Card className="border-border/60 shadow-card">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Send a Message</CardTitle></CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Name</Label>
                        <Input placeholder="Your name" required className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input type="email" placeholder="you@example.com" required className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Message</Label>
                        <Textarea placeholder="How can we help?" rows={4} required className="text-sm" />
                      </div>
                      <Button type="submit" className="w-full" size="sm" disabled={sending}>
                        {sending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </FadeIn>
              <FadeIn delay={0.2} className="space-y-5 pt-2">
                {[
                  { icon: Mail, title: "Email", info: "support@medprep.com" },
                  { icon: Phone, title: "Phone", info: "+1 (555) 123-4567" },
                  { icon: MapPin, title: "Address", info: "123 Medical Drive, Education City" },
                ].map((c) => (
                  <div key={c.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <c.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{c.title}</h3>
                      <p className="text-[13px] text-muted-foreground">{c.info}</p>
                    </div>
                  </div>
                ))}
              </FadeIn>
            </div>
          </div>
        </section>
      </PageTransition>
    </PublicLayout>
  );
}
