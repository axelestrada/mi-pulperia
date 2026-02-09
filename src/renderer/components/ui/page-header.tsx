type Props = {
  title: string
  description?: string
  actions?: React.ReactNode
  backButton?: boolean
}

export const PageHeader = ({ title, description, actions }: Props) => {
  return (
    <header className="mb-6 flex w-full items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-default-900 text-xl font-bold lg:text-3xl">
          {title}
        </h1>
        <p className="text-small text-default-400 lg:text-medium">
          {description}
        </p>
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}
