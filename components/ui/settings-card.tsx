import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

type SettingsCardProps = {
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export function SettingsCard({ title, description, headerRight, children }: SettingsCardProps) {
  return (
    <CardContainer containerClassName="py-0 w-full" className="w-full">
      <CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
        <CardItem
          translateZ={20}
          className="w-full bg-surface border border-border rounded-xl p-6 shadow-card"
        >
          <div className={`flex items-start justify-between ${headerRight ? "mb-4" : "mb-1"}`}>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {headerRight && <div className="shrink-0 ml-4">{headerRight}</div>}
          </div>
          {description && (
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">{description}</p>
          )}
          {children}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
