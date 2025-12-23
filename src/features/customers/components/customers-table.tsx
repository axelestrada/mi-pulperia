import { formatCurrency } from "@/shared/utils/formatCurrency";
import {
  AlertTriangleIcon,
  CreditCardIcon,
  DollarSignIcon,
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
} from "lucide-react";

import { format } from "date-fns";

type Customer = {
  id: string;
  name: string;
  address: string;
  phone: string;
  creditLimit: number;
  currentDebt: number;
  lastPurchase: Date;
  status: "active" | "inactive";
};

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Juan Pérez",
    address: "Calle Falsa 123",
    phone: "555-1234",
    creditLimit: 500,
    currentDebt: 150,
    lastPurchase: new Date("2024-06-10"),
    status: "active",
  },
  {
    id: "2",
    name: "María Gómez",
    address: "Avenida Siempre Viva 742",
    phone: "555-5678",
    creditLimit: 300,
    currentDebt: 0,
    lastPurchase: new Date("2024-05-22"),
    status: "inactive",
  },
];

export const CustomersTable = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  return (
    <div className="space-y-4">
      <div className="rounded-xl flex gap-4">
        <div className="relative w-full">
          <SearchIcon className="size-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />

          <Input
            className="w-full pl-10 pr-5"
            placeholder="Buscar por nombre, teléfono o dirección..."
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Clientes</SelectLabel>
              <SelectItem value="all">Todos los clientes</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="with_debt">Con deuda</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className="border p-4 py-8 rounded-xl flex items-center">
          <UserRoundCheckIcon className="size-5 text-green-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">
              Clientes activos
            </span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <CreditCardIcon className="size-5 text-blue-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">Con crédito</span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <DollarSignIcon className="size-5 text-orange-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">{formatCurrency(550)}</span>
            <span className="text-sm text-muted-foreground">Deuda total</span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <AlertTriangleIcon className="size-5 text-red-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">
              Deudas vencidas
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Límite de Crédito</TableHead>
              <TableHead>Deuda Actual</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="cursor-pointer">
                <TableCell>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.address}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{formatCurrency(customer.creditLimit)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        customer.currentDebt > 0
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {formatCurrency(customer.currentDebt)}
                    </span>
                    {/* {getDaysOverdue(customer) > 15 && (
                      <Badge variant="destructive" className="text-xs">
                        {getDaysOverdue(customer)}d
                      </Badge>
                    )} */}
                    {/* TODO: Implementar indicador de días de atraso */}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastPurchase
                    ? format(customer.lastPurchase, "dd-MM-yyyy")
                    : "Nunca"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      customer.status === "active" ? "default" : "destructive"
                    }
                    className={
                      customer.status === "active" ? "bg-green-600" : ""
                    }
                  >
                    {customer.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <EditIcon className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {customer.currentDebt > 0 && (
                        <DropdownMenuItem>
                          <DollarSignIcon className="h-4 w-4 mr-2" />
                          Registrar Abono
                        </DropdownMenuItem>
                      )}
                      {customer.status === "active" ? (
                        <DropdownMenuItem className="text-red-600">
                          <UserRoundXIcon className="h-4 w-4 mr-2" />
                          Deshabilitar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <UserRoundCheckIcon className="h-4 w-4 mr-2" />
                          Habilitar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
