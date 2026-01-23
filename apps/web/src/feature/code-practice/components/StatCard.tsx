import { Card, CardContent } from "@workspace/ui/components/Card";

export const StatCard: React.FC<{ icon: React.ElementType; label: string; value: number | string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
