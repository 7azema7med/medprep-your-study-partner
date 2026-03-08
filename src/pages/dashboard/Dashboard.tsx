import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageTransition, FadeIn } from "@/components/motion";

interface Stats {
  testsCreated: number;
  testsCompleted: number;
  testsSuspended: number;
  totalQuestions: number;
  usedQuestions: number;
  correct: number;
  incorrect: number;
  omitted: number;
}

function DonutChart({ percent, label, color, size = 140 }: { percent: number; label: string; color: string; size?: number }) {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx={center} cy={center} r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x={center} y={center - 2} textAnchor="middle" className="fill-foreground text-lg font-bold">{percent}%</text>
        <text x={center} y={center + 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">{label}</text>
      </svg>
    </div>
  );
}

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
    <span className="text-[12px] text-muted-foreground">{label}</span>
    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-semibold text-foreground">{value}</span>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      const [testsRes, subjectsRes] = await Promise.all([
        supabase.from("tests").select("status, score").eq("user_id", user!.id),
        supabase.from("subjects").select("question_count"),
      ]);
      const tests = testsRes.data || [];
      const totalQ = (subjectsRes.data || []).reduce((s, r) => s + r.question_count, 0);
      const completed = tests.filter((t) => t.status === "submitted");
      const suspended = tests.filter((t) => t.status === "suspended");
      setStats({
        testsCreated: tests.length,
        testsCompleted: completed.length,
        testsSuspended: suspended.length,
        totalQuestions: totalQ,
        usedQuestions: 0,
        correct: completed.reduce((s, t) => s + (t.score ? Math.round(Number(t.score)) : 0), 0),
        incorrect: 0,
        omitted: 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const s = stats!;
  const totalAnswered = s.correct + s.incorrect + s.omitted;
  const scorePercent = totalAnswered > 0 ? Math.round((s.correct / totalAnswered) * 100) : 0;
  const usedPercent = s.totalQuestions > 0 ? Math.round((s.usedQuestions / s.totalQuestions) * 100) : 0;

  return (
    <PageTransition className="space-y-5">
      <h1 className="text-lg font-bold text-foreground">Statistics</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center justify-center pt-5 pb-3">
              <DonutChart percent={scorePercent} label="Correct" color="hsl(var(--success))" />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-1"><CardTitle className="text-[13px] font-semibold">Your Score</CardTitle></CardHeader>
            <CardContent>
              <StatRow label="Total Correct" value={s.correct} />
              <StatRow label="Total Incorrect" value={s.incorrect} />
              <StatRow label="Total Omitted" value={s.omitted} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-1"><CardTitle className="text-[13px] font-semibold">Answer Changes</CardTitle></CardHeader>
            <CardContent>
              <StatRow label="Correct → Incorrect" value={0} />
              <StatRow label="Incorrect → Correct" value={0} />
              <StatRow label="Incorrect → Incorrect" value={0} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FadeIn>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex items-center justify-center pt-5 pb-3">
              <DonutChart percent={usedPercent} label="Used" color="hsl(var(--primary))" />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-1"><CardTitle className="text-[13px] font-semibold">QBank Usage</CardTitle></CardHeader>
            <CardContent>
              <StatRow label="Used Questions" value={s.usedQuestions} />
              <StatRow label="Unused Questions" value={s.totalQuestions - s.usedQuestions} />
              <StatRow label="Total Questions" value={s.totalQuestions} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-1"><CardTitle className="text-[13px] font-semibold">Test Count</CardTitle></CardHeader>
            <CardContent>
              <StatRow label="Tests Created" value={s.testsCreated} />
              <StatRow label="Tests Completed" value={s.testsCompleted} />
              <StatRow label="Suspended Tests" value={s.testsSuspended} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
