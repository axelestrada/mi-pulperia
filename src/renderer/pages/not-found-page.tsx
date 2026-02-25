import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export const NotFoundPage = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 · Página no encontrada</EmptyTitle>
        <EmptyDescription>
          No pudimos encontrar la página que estás buscando. Es posible que el
          enlace sea incorrecto o que el contenido ya no exista.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          ¿Necesitas ayuda?{' '}
          <a
            href="mailto:axele1524@gmail.com"
            className="font-medium underline underline-offset-4"
          >
            Contacta a soporte
          </a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
