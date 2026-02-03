import { Card, CardContent } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";

export const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  gradient?: string;
}> = ({ icon: Icon, label, value, gradient }) => (
  <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", gradient)} />
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl text-white", gradient)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
