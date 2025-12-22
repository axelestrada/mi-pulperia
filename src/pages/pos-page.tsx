import { formatCurrency } from "@/shared/utils/formatCurrency";
import {
  ClockIcon,
  CreditCardIcon,
  MousePointerClickIcon,
  PauseIcon,
  PlusIcon,
  ScanIcon,
  SearchIcon,
  ShoppingCartIcon,
} from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Coca-Cola 600ml",
    sku: "COCA-600",
    barcode: "7501055363057",
    price: 15.0,
    cost: 11.25,
    stock: 48,
    category: "Bebidas",
    image: "/images/products/coca-cola-600ml.jpg",
  },
  {
    id: "2",
    name: "Taqueritos Verdes",
    sku: "TAQ-VER",
    barcode: "7501055320011",
    price: 10.0,
    cost: 7.0,
    stock: 24,
    category: "Snacks",
  },
  {
    id: "3",
    name: "Pan Bimbo Blanco",
    sku: "PAN-BIM",
    barcode: "7501030400016",
    price: 15.0,
    cost: 12.0,
    stock: 12,
    category: "Panadería",
  },
  {
    id: "4",
    name: "Detergente Ace 1kg",
    sku: "ACE-1KG",
    barcode: "7501001234567",
    price: 50.0,
    cost: 35.0,
    stock: 8,
    category: "Limpieza",
  },
  {
    id: "5",
    name: "Huevos (Docena)",
    sku: "HUEV-DOC",
    barcode: "7501002345678",
    price: 30.0,
    cost: 25.5,
    stock: 15,
    category: "Abarrotes",
  },
  {
    id: "6",
    name: "Coca-Cola 3L",
    sku: "COCA-3L",
    barcode: "7501055363064",
    price: 35.0,
    cost: 26.25,
    stock: 2,
    category: "Bebidas",
  },
  {
    id: "7",
    name: "Taqueritos Rojos",
    sku: "TAQ-ROJ",
    barcode: "7501055320028",
    price: 10.0,
    cost: 7.0,
    stock: 18,
    category: "Snacks",
  },
  {
    id: "8",
    name: "Arroz Diana 5lb",
    sku: "ARR-DIA",
    barcode: "7501003456789",
    price: 45.0,
    cost: 38.25,
    stock: 6,
    category: "Abarrotes",
  },
];

const mockCustomers = [
  {
    id: "1",
    name: "Juan Pérez",
    phone: "+504 9876-5432",
    creditLimit: 500,
    currentDebt: 150,
  },
  {
    id: "2",
    name: "María González",
    phone: "+504 8765-4321",
    creditLimit: 300,
    currentDebt: 80,
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    phone: "+504 7654-3210",
    creditLimit: 1000,
    currentDebt: 320,
  },
];

const categories = [
  "Todos",
  "Bebidas",
  "Snacks",
  "Abarrotes",
  "Limpieza",
  "Panadería",
];

export const PosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-4 pt-4">
      <div className="space-y-4">
        <div className="p-4 border rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <SearchIcon className="size-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />

              <Input
                className="w-full pl-10 pr-5"
                placeholder="Buscar producto, SKU o código de barras..."
              />
            </div>

            <Button variant="outline">
              <ScanIcon className="size-4" />
              Escanear
            </Button>

            <Button variant="outline">
              <PlusIcon className="size-4" />
              Manual
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 overflow-y-auto">
          {mockProducts.map((product) => (
            <div
              className="border rounded-lg p-3 cursor-pointer hover:shadow-xl transition-shadow shadow-slate-200"
              key={product.id}
            >
              <SafeImage
                className="aspect-square w-full object-cover mb-2"
                src={product.image}
                alt={product.name}
              />

              <div className="space-y-1">
                <p className="font-semibold text-sm leading-tight line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {product.stock}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="size-5" />
            <span className="font-semibold">Carrito (2)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm">
              <ClockIcon />
              Pausadas
            </Button>
            <Button variant="outline" size="icon-sm">
              <PauseIcon />
            </Button>
          </div>
        </div>

        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            <span className="font-semibold">Cliente</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm">
              <MousePointerClickIcon className="size-5" />
              Seleccionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
