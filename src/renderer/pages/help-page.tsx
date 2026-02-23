import { useState } from 'react'
import {
  Search,
  Book,
  Video,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  FileText,
  Lightbulb
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos',
    icon: Lightbulb,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    articles: [
      'Configuración inicial del sistema',
      'Creando tu primer producto',
      'Realizando tu primera venta',
      'Configurando impresoras',
    ],
  },
  {
    id: 'sales',
    title: 'Ventas',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    articles: [
      'Cómo realizar una venta',
      'Gestión de métodos de pago',
      'Aplicar descuentos',
      'Manejo de devoluciones',
    ],
  },
  {
    id: 'inventory',
    title: 'Inventario',
    icon: Book,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    articles: [
      'Agregar productos al inventario',
      'Gestión de categorías',
      'Control de stock',
      'Ajustes y mermas',
    ],
  },
  {
    id: 'reports',
    title: 'Reportes',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    articles: [
      'Generar reportes de ventas',
      'Análisis de inventario',
      'Reportes de ganancias',
      'Exportar datos',
    ],
  },
]

const faqItems = [
  {
    question: '¿Cómo puedo cambiar el precio de un producto?',
    answer: 'Puedes cambiar el precio de un producto yendo a la sección de Productos, seleccionando el producto que deseas editar, y modificando el precio en el formulario de edición.',
  },
  {
    question: '¿Puedo usar código de barras con el sistema?',
    answer: 'Sí, el sistema es compatible con lectores de código de barras. Puedes configurar esta función en la sección de Configuración > Punto de Venta.',
  },
  {
    question: '¿Cómo hago una devolución?',
    answer: 'Para hacer una devolución, ve a la sección de Ventas, busca la venta original, y selecciona la opción de devolución. El sistema ajustará automáticamente el inventario.',
  },
  {
    question: '¿Puedo imprimir recibos?',
    answer: 'Sí, puedes configurar impresoras térmicas o normales en la sección de Configuración. El sistema puede imprimir recibos automáticamente después de cada venta.',
  },
  {
    question: '¿Cómo gestiono el inventario con fechas de vencimiento?',
    answer: 'El sistema permite registrar fechas de vencimiento para productos. Ve a Configuración > Inventario para habilitar esta función y recibir alertas de productos próximos a vencer.',
  },
  {
    question: '¿Puedo generar reportes personalizados?',
    answer: 'El sistema incluye varios reportes predefinidos. Puedes filtrar por fechas, categorías, y otros criterios para obtener la información que necesitas.',
  },
]

const tutorials = [
  {
    title: 'Configuración Inicial Completa',
    description: 'Aprende a configurar tu pulpería desde cero',
    duration: '15 min',
    difficulty: 'Principiante',
    topics: ['Configuración', 'Productos', 'Categorías'],
  },
  {
    title: 'Gestión Avanzada de Inventario',
    description: 'Domina las funciones avanzadas del inventario',
    duration: '25 min',
    difficulty: 'Intermedio',
    topics: ['Inventario', 'Lotes', 'Ajustes'],
  },
  {
    title: 'Análisis de Ventas y Reportes',
    description: 'Cómo interpretar y usar los reportes del sistema',
    duration: '20 min',
    difficulty: 'Intermedio',
    topics: ['Reportes', 'Análisis', 'Ventas'],
  },
  {
    title: 'Optimización para Mayor Eficiencia',
    description: 'Tips y trucos para usar el sistema más eficientemente',
    duration: '30 min',
    difficulty: 'Avanzado',
    topics: ['Optimización', 'Atajos', 'Configuración'],
  },
]

export function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Encuentra respuestas, tutoriales y obtén soporte para tu sistema de pulpería
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en la ayuda..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="guides" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">
            <Book className="mr-2 h-4 w-4" />
            Guías
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <Video className="mr-2 h-4 w-4" />
            Tutoriales
          </TabsTrigger>
          <TabsTrigger value="faq">
            <MessageCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="support">
            <Phone className="mr-2 h-4 w-4" />
            Soporte
          </TabsTrigger>
        </TabsList>

        {/* Guides */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {helpCategories.map(category => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.bgColor}`}>
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm hover:text-primary cursor-pointer group">
                          <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Tutorials */}
        <TabsContent value="tutorials" className="space-y-4">
          <div className="grid gap-4">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tutorial.duration}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {tutorial.topics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Ver Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Respuestas a las consultas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQ.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No se encontraron resultados para "{searchTerm}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Options */}
            <Card>
              <CardHeader>
                <CardTitle>Contacta con Soporte</CardTitle>
                <CardDescription>
                  Obtén ayuda personalizada de nuestro equipo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">soporte@mipulperia.com</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">+505 8888-8888</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">Chat en Vivo</p>
                    <p className="text-sm text-muted-foreground">Disponible 9AM - 6PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    En línea
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
                <CardDescription>
                  Detalles técnicos para soporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Versión:</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sistema:</span>
                  <span className="text-sm font-medium">Windows 11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Base de datos:</span>
                  <span className="text-sm font-medium">SQLite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Última actualización:</span>
                  <span className="text-sm font-medium">01/02/2024</span>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4">
                  Copiar Información del Sistema
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Adicionales</CardTitle>
              <CardDescription>
                Enlaces útiles y documentación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Manual de Usuario</p>
                    <p className="text-xs text-muted-foreground">Documentación completa</p>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <Video className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Videos Tutoriales</p>
                    <p className="text-xs text-muted-foreground">Canal de YouTube</p>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <Users className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Comunidad</p>
                    <p className="text-xs text-muted-foreground">Foro de usuarios</p>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4">
                  <Star className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Novedades</p>
                    <p className="text-xs text-muted-foreground">Actualizaciones y mejoras</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
