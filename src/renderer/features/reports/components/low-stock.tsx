const lowStockItems = [
  {
    name: 'Coca-Cola 3L',
    current: 2,
    minimum: 5,
    supplier: 'Distribuidora Central',
    urgency: 'high',
  },
  {
    name: 'Detergente Ace 2kg',
    current: 1,
    minimum: 3,
    supplier: 'Limpieza Total',
    urgency: 'high',
  },
  {
    name: 'Huevos (Docena)',
    current: 3,
    minimum: 10,
    supplier: 'Granja San José',
    urgency: 'medium',
  },
  {
    name: 'Aceite Capullo 1L',
    current: 4,
    minimum: 8,
    supplier: 'Distribuidora Central',
    urgency: 'medium',
  },
  {
    name: 'Arroz Diana 5lb',
    current: 6,
    minimum: 12,
    supplier: 'Abarrotes Mayorista',
    urgency: 'low',
  },
]

export const LowStock = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos con Stock Bajo</CardTitle>
        <CardDescription>
          Productos que necesitan reabastecimiento
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {lowStockItems.map(item => (
            <div
              className="flex items-center justify-between border p-3 rounded-lg"
              key={item.name}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock: {item.current} • Mínimo: {item.minimum} •{' '}
                  {item.supplier}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    item.urgency === 'high'
                      ? 'destructive'
                      : item.urgency === 'medium'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {item.urgency === 'high'
                    ? 'Urgente'
                    : item.urgency === 'medium'
                      ? 'Medio'
                      : 'Bajo'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
