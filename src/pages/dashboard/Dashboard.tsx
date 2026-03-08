import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-semibold">{value}</span>
  </div>
);

function DonutChart({ percent, label, color }: { percent: number; label: string; color: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          className="transition-all duration-1000"
        />
        <text x="90" y="85" textAnchor="middle" className="fill-foreground text-2xl font-bold">{percent}%</text>
        <text x="90" y="105" textAnchor="middle" className="fill-muted-foreground text-sm">{label}</text>
      </svg>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Statistics</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score donut */}
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center pt-6">
            <DonutChart percent={65} label="Correct" color="hsl(var(--success))" />
          </CardContent>
        </Card>

        {/* Your Score */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <StatRow label="Total Correct" value={78} />
            <StatRow label="Total Incorrect" value={32} />
            <StatRow label="Total Omitted" value={10} />
          </CardContent>
        </Card>

        {/* Answer Changes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Answer Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <StatRow label="Correct to Incorrect" value={3} />
            <StatRow label="Incorrect to Correct" value={5} />
            <StatRow label="Incorrect to Incorrect" value={1} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* QBank Usage donut */}
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center pt-6">
            <DonutChart percent={12} label="Used" color="hsl(var(--primary))" />
          </CardContent>
        </Card>

        {/* QBank Usage Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">QBank Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <StatRow label="Used Questions" value={197} />
            <StatRow label="Unused Questions" value={1448} />
            <StatRow label="Total Questions" value={1645} />
          </CardContent>
        </Card>

        {/* Test Count */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Test Count</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <StatRow label="Tests Created" value={6} />
            <StatRow label="Tests Completed" value={4} />
            <StatRow label="Suspended Tests" value={2} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
