import { Card, CardContent } from "@/components/ui/card";

type SettingsCardProps = {
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export function SettingsCard({ title, description, headerRight, children }: SettingsCardProps) {
  return (
    <Card className="bg-surface border-border shadow-card">
      <CardContent className="p-6">
        <div className={`flex items-start justify-between ${headerRight ? "mb-4" : "mb-1"}`}>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {headerRight && <div className="shrink-0 ml-4">{headerRight}</div>}
        </div>
        {description && (
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">{description}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
