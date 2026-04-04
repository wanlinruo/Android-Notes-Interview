import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  sublabel?: string;
  value: number | string;
  icon: string;
  color?: "indigo" | "violet" | "blue" | "amber" | "rose";
}

const colorMap = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400",
  violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
};

export function StatsCard({ label, sublabel, value, icon, color = "indigo" }: StatsCardProps) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</div>
          <div className="text-xs text-muted-foreground">
            {label}
            {sublabel && <span className="ml-1 text-[10px] opacity-70">({sublabel})</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
