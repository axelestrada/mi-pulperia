import { cn } from '@/lib/utils'

type Props = {
  value: string
  label?: string
  copiedText?: string
  className?: string
}

export const CopyableField = ({
  value,
  label,
  copiedText,
  className,
}: Props) => {
  return (
    <div className={cn('flex items-center gap-2 text-default-500', className)}>
      <span>{label ?? value}</span>
      <Button
        size="sm"
        variant="light"
        isIconOnly
        className="text-default-500"
        onPress={() => {
          navigator.clipboard.writeText(String(copiedText ?? value))
        }}
      >
        <IconSolarCopyLinear />
      </Button>
    </div>
  )
}
