import { TelescopeIcon } from "lucide-react";

export const ComingSoon = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon" className="mb-8">
        <TelescopeIcon className="size-20" />
      </EmptyMedia>
      <EmptyTitle>Funcionalidad en desarrollo</EmptyTitle>
      <EmptyDescription>
        Esta funcionalidad estará disponible próximamente.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);
