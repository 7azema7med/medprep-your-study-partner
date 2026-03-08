import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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

function DonutChart({ percent, label, color, size = 160 }: { percent: number; label: string; color: string; size?: number }) {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx={center} cy={center} r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-1000"
        />
        <text x={center} y={center - 4} textAnchor="middle" className="fill-foreground text-xl font-bold">{percent}%</text>
        <text x={center} y={center + 14} textAnchor="middle" className="fill-muted-foreground text-[11px]">{label}</text>
      </svg>
    </div>
  );
}

const StatRow = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${color || "bg-secondary text-foreground"}`}>{value}</span>
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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const s = stats!;
  const totalAnswered = s.correct + s.incorrect + s.omitted;
  const scorePercent = totalAnswered > 0 ? Math.round((s.correct / totalAnswered) * 100) : 0;
  const usedPercent = s.totalQuestions > 0 ? Math.round((s.usedQuestions / s.totalQuestions) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-foreground">Statistics</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-center pt-6 pb-4">
            <DonutChart percent={scorePercent} label="Correct" color="hsl(var(--success))" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm font-semibold">Your Score</CardTitle></CardHeader>
          <CardContent>
            <StatRow label="Total Correct" value={s.correct} />
            <StatRow label="Total Incorrect" value={s.incorrect} />
            <StatRow label="Total Omitted" value={s.omitted} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm font-semibold">Answer Changes</CardTitle></CardHeader>
          <CardContent>
            <StatRow label="Correct → Incorrect" value={0} />
            <StatRow label="Incorrect → Correct" value={0} />
            <StatRow label="Incorrect → Incorrect" value={0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-center pt-6 pb-4">
            <DonutChart percent={usedPercent} label="Used" color="hsl(var(--primary))" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm font-semibold">QBank Usage</CardTitle></CardHeader>
          <CardContent>
            <StatRow label="Used Questions" value={s.usedQuestions} />
            <StatRow label="Unused Questions" value={s.totalQuestions - s.usedQuestions} />
            <StatRow label="Total Questions" value={s.totalQuestions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm font-semibold">Test Count</CardTitle></CardHeader>
          <CardContent>
            <StatRow label="Tests Created" value={s.testsCreated} />
            <StatRow label="Tests Completed" value={s.testsCompleted} />
            <StatRow label="Suspended Tests" value={s.testsSuspended} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
