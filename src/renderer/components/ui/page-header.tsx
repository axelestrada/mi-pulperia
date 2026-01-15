type Props = {
  title: string
  description?: string
  actions?: React.ReactNode
  backButton?: boolean
}

export const PageHeader = ({
  title,
  description,
  actions,
  backButton,
}: Props) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {backButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <IconLucideArrowLeft className="size-5" />
          </Button>
        )}

        <div>
          <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
