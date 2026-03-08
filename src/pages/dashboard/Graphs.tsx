import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const subjectData = [
  { subject: "Anatomy", score: 71 },
  { subject: "Physiology", score: 67 },
  { subject: "Pharm", score: 56 },
  { subject: "Path", score: 70 },
  { subject: "Biochem", score: 50 },
  { subject: "Micro", score: 80 },
];

const overallData = [
  { name: "Correct", value: 330 },
  { name: "Incorrect", value: 120 },
  { name: "Omitted", value: 50 },
];

const COLORS = ["hsl(142, 70%, 45%)", "hsl(0, 72%, 51%)", "hsl(215, 15%, 70%)"];

export default function Graphs() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Graphs</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Score by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(207, 75%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Overall Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {overallData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
