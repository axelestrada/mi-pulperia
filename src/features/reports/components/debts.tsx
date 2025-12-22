import { formatCurrency } from "@/shared/utils/formatCurrency";

const customerDebts = [
  {
    name: "Juan Pérez",
    debt: 450,
    daysOverdue: 15,
    phone: "+504 9876-5432",
    lastPayment: "2024-01-01",
  },
  {
    name: "María González",
    debt: 280,
    daysOverdue: 8,
    phone: "+504 8765-4321",
    lastPayment: "2024-01-05",
  },
  {
    name: "Carlos Rodríguez",
    debt: 320,
    daysOverdue: 22,
    phone: "+504 7654-3210",
    lastPayment: "2023-12-28",
  },
  {
    name: "Ana López",
    debt: 200,
    daysOverdue: 5,
    phone: "+504 6543-2109",
    lastPayment: "2024-01-08",
  },
];

export const Debts = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deudas de Clientes</CardTitle>
        <CardDescription>Clientes con crédito pendiente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerDebts.map((customer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {customer.phone} • Último pago:{" "}
                  {new Date(customer.lastPayment).toLocaleDateString("es-HN")}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {formatCurrency(customer.debt)}
                </div>
                <Badge
                  variant={
                    customer.daysOverdue > 15 ? "destructive" : "secondary"
                  }
                >
                  {customer.daysOverdue} días
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
