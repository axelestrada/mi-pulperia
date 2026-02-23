import { useState } from 'react'
import {
  Save,
  Printer,
  DollarSign,
  Store,
  User,
  Bell,
  Shield,
  Database,
  Palette,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    name: 'Mi Pulpería',
    address: 'Barrio Central, Managua',
    phone: '8888-8888',
    email: 'contacto@mipulperia.com',
    ruc: '281-010180-1001K',
    logo: '',
    currency: 'NIO',
    taxRate: 15,
  })

  // POS Settings
  const [posSettings, setPosSettings] = useState({
    autoprint: true,
    printReceipt: true,
    askCustomerInfo: false,
    defaultPaymentMethod: 'cash',
    enableBarcode: true,
    soundEnabled: true,
    quickSaleEnabled: true,
  })

  // Inventory Settings
  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: 10,
    enableExpiration: true,
    autoDeductStock: true,
    enableBarcodeGeneration: true,
    stockAlerts: true,
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    salesReports: true,
    paymentReminders: true,
    systemUpdates: false,
    emailNotifications: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Personaliza y configura tu sistema de pulpería
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="business">
            <Store className="mr-2 h-4 w-4" />
            Negocio
          </TabsTrigger>
          <TabsTrigger value="pos">
            <Printer className="mr-2 h-4 w-4" />
            Punto de Venta
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Database className="mr-2 h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
              <CardDescription>
                Configura la información básica de tu pulpería
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    value={businessSettings.name}
                    onChange={e =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={businessSettings.phone}
                    onChange={e =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessSettings.email}
                    onChange={e =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input
                    id="ruc"
                    value={businessSettings.ruc}
                    onChange={e =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        ruc: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={e =>
                    setBusinessSettings(prev => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="min-h-[80px]"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={businessSettings.currency}
                    onValueChange={value =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HNL">Lempira (L)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={businessSettings.taxRate}
                    onChange={e =>
                      setBusinessSettings(prev => ({
                        ...prev,
                        taxRate: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS Settings */}
        <TabsContent value="pos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Punto de Venta</CardTitle>
              <CardDescription>
                Personaliza el comportamiento del sistema de ventas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Impresión Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Imprimir recibo automáticamente después de cada venta
                  </p>
                </div>
                <Switch
                  checked={posSettings.autoprint}
                  onCheckedChange={checked =>
                    setPosSettings(prev => ({ ...prev, autoprint: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Imprimir Recibos</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar impresión de recibos
                  </p>
                </div>
                <Switch
                  checked={posSettings.printReceipt}
                  onCheckedChange={checked =>
                    setPosSettings(prev => ({ ...prev, printReceipt: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Solicitar Información del Cliente</Label>
                  <p className="text-sm text-muted-foreground">
                    Pedir nombre y teléfono del cliente en cada venta
                  </p>
                </div>
                <Switch
                  checked={posSettings.askCustomerInfo}
                  onCheckedChange={checked =>
                    setPosSettings(prev => ({
                      ...prev,
                      askCustomerInfo: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar Código de Barras</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir escaneo de códigos de barras
                  </p>
                </div>
                <Switch
                  checked={posSettings.enableBarcode}
                  onCheckedChange={checked =>
                    setPosSettings(prev => ({
                      ...prev,
                      enableBarcode: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sonidos del Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproducir sonidos para acciones del sistema
                  </p>
                </div>
                <Switch
                  checked={posSettings.soundEnabled}
                  onCheckedChange={checked =>
                    setPosSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Método de Pago Predeterminado</Label>
                <Select
                  value={posSettings.defaultPaymentMethod}
                  onValueChange={value =>
                    setPosSettings(prev => ({
                      ...prev,
                      defaultPaymentMethod: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Inventario</CardTitle>
              <CardDescription>
                Gestiona cómo funciona el sistema de inventario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Umbral de Stock Bajo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={inventorySettings.lowStockThreshold}
                  onChange={e =>
                    setInventorySettings(prev => ({
                      ...prev,
                      lowStockThreshold: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Cantidad mínima antes de mostrar alerta de stock bajo
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gestión de Fechas de Vencimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar control de fechas de vencimiento
                  </p>
                </div>
                <Switch
                  checked={inventorySettings.enableExpiration}
                  onCheckedChange={checked =>
                    setInventorySettings(prev => ({
                      ...prev,
                      enableExpiration: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deducción Automática de Stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Reducir automáticamente el stock al realizar ventas
                  </p>
                </div>
                <Switch
                  checked={inventorySettings.autoDeductStock}
                  onCheckedChange={checked =>
                    setInventorySettings(prev => ({
                      ...prev,
                      autoDeductStock: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generación Automática de Códigos</Label>
                  <p className="text-sm text-muted-foreground">
                    Generar códigos de barras automáticamente para productos
                    nuevos
                  </p>
                </div>
                <Switch
                  checked={inventorySettings.enableBarcodeGeneration}
                  onCheckedChange={checked =>
                    setInventorySettings(prev => ({
                      ...prev,
                      enableBarcodeGeneration: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificaciones cuando el stock esté bajo
                  </p>
                </div>
                <Switch
                  checked={inventorySettings.stockAlerts}
                  onCheckedChange={checked =>
                    setInventorySettings(prev => ({
                      ...prev,
                      stockAlerts: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Controla qué notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Stock Bajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando los productos tengan stock bajo
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.lowStockAlerts}
                  onCheckedChange={checked =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      lowStockAlerts: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reportes de Ventas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir resúmenes diarios y semanales de ventas
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.salesReports}
                  onCheckedChange={checked =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      salesReports: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de Pago</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre pagos vencidos o próximos a vencer
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.paymentReminders}
                  onCheckedChange={checked =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      paymentReminders: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualizaciones del Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre nuevas versiones y actualizaciones
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={checked =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      systemUpdates: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={checked =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      emailNotifications: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios y permisos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La gestión completa de usuarios estará disponible en una
                  próxima actualización.
                </p>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Administrador Principal</h4>
                      <p className="text-sm text-muted-foreground">
                        admin@mipulperia.com
                      </p>
                    </div>
                    <Badge>Activo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select defaultValue="system">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-muted-foreground">
                  Más opciones de personalización estarán disponibles
                  próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
