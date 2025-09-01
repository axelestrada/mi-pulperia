type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export const PageHeader = ({ title, description, actions }: Props) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
