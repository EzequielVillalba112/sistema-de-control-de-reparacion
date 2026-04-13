# Prisma Schema - Sistema de Control de Inventario y Gestión de Reparaciones de Celulares

## Schema Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   
  role          Role      @default(TECHNICIAN)
  image         String?
  repairsAsTech Repair[]  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Customer {
  id          String    @id @default(cuid())
  name        String
  phone       String    @unique
  email       String?
  address     String?
  repairs     Repair[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PhoneModel {
  id          String         @id @default(cuid())
  brand       String
  model       String
  storage     String?
  color       String?
  repairs     Repair[]
  inventory   InventoryItem[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@unique([brand, model, storage, color]) // evita duplicados de modelos
}

model InventoryItem {
  id              String    @id @default(cuid())
  name            String
  sku             String    @unique
  category        Category
  quantity        Int       @default(0)
  minStock        Int       @default(5)
  purchasePrice   Decimal   @db.Decimal(10, 2)
  salePrice       Decimal   @db.Decimal(10, 2)
  phoneModelId    String?
  phoneModel      PhoneModel? @relation(fields: [phoneModelId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([sku])
  @@index([category])
}

model Repair {
  id               String        @id @default(cuid())
  ticketNumber     String        @unique @default("REP-####") 
  customerId       String
  customer         Customer      @relation(fields: [customerId], references: [id])
  phoneModelId     String
  phoneModel       PhoneModel    @relation(fields: [phoneModelId], references: [id])
  imei             String?
  password         String?
  problem          String        // falla reportada por el cliente
  diagnosis        String?
  status           RepairStatus  @default(RECEIVED)
  technicianId     String?
  technician       User?         @relation(fields: [technicianId], references: [id])
  partsUsed        RepairPart[]
  totalCost        Decimal       @db.Decimal(10, 2) @default(0)
  advancePayment   Decimal       @db.Decimal(10, 2) @default(0)
  receivedAt       DateTime      @default(now())
  completedAt      DateTime?
  deliveredAt      DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  @@index([status])
  @@index([receivedAt])
}

model RepairPart {
  id              String        @id @default(cuid())
  repairId        String
  repair          Repair        @relation(fields: [repairId], references: [id], onDelete: Cascade)
  inventoryItemId String
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  quantity        Int
  price           Decimal       @db.Decimal(10, 2)

--------------------------------------------------------------------------------------------
                        Explicación Detallada de Cada Modelo
--------------------------------------------------------------------------------------------
User – Usuarios del sistema
Usuarios que pueden acceder al sistema (técnicos, administradores y personal de solo lectura).

id: Identificador único (usa cuid() que es más legible y seguro que uuid).
name: Nombre completo del usuario.
email: Correo electrónico único, se usa para el login.
password: Contraseña hasheada (opcional si se usa autenticación con Google, etc.).
role: Rol del usuario (ADMIN, TECHNICIAN, VIEWER). Controla los permisos.
image: URL de la foto de perfil.
repairsAsTech: Relación con las reparaciones que este técnico realiza.
createdAt / updatedAt: Fechas de creación y última modificación (auditoría).
--------------------------------------------------------------------------------------------
Customer – Clientes
Personas que traen celulares para reparar.

id: Identificador único.
name: Nombre y apellido del cliente.
phone: Teléfono principal (único). Clave para búsquedas rápidas.
email: Correo electrónico (opcional).
address: Dirección física (útil si ofreces delivery).
repairs: Historial de todas las reparaciones del cliente.
createdAt / updatedAt: Fechas de auditoría.

---------------------------------------------------------------------------------------------
PhoneModel – Modelos de Teléfonos
Catálogo de modelos de celulares (usado tanto en reparaciones como en inventario).

id: Identificador único.
brand: Marca (Apple, Samsung, Xiaomi, Motorola, etc.).
model: Modelo específico (iPhone 13 Pro, Galaxy A54, Redmi Note 12, etc.).
storage: Capacidad de almacenamiento (64GB, 128GB, 256GB, etc.).
color: Color del equipo (opcional pero útil).
repairs: Reparaciones realizadas a este modelo.
inventory: Repuestos asociados a este modelo.
@@unique([brand, model, storage, color]): Evita duplicados de modelos similares.
createdAt / updatedAt: Fechas de auditoría.

-----------------------------------------------------------------------------------------------
InventoryItem – Ítems de Inventario
Repuestos, accesorios y celulares en stock.

id: Identificador único.
name: Nombre descriptivo ("Pantalla OLED iPhone 13 Pro", "Batería original Samsung A54").
sku: Código único del producto (importante para control de stock).
category: Categoría del ítem (ayuda en filtros y reportes).
quantity: Cantidad actual disponible en stock.
minStock: Stock mínimo. Se usa para generar alertas cuando baja.
purchasePrice: Precio de compra del repuesto.
salePrice: Precio de venta o costo al usar en reparación.
phoneModelId: Relación opcional con un modelo de teléfono específico.
@@index([sku]) y @@index([category]): Mejoran la velocidad de búsqueda.

------------------------------------------------------------------------------------------------
Repair – Orden de Reparación
El núcleo del sistema. Representa cada trabajo de reparación.

id: Identificador único.
ticketNumber: Número automático del ticket (ej: REP-0001).
customerId / customer: Cliente que trae el equipo.
phoneModelId / phoneModel: Modelo del teléfono a reparar.
imei: IMEI del dispositivo (útil para rastreo y garantía).
password: Contraseña o PIN del celular (para poder desbloquearlo).
problem: Falla reportada por el cliente.
diagnosis: Diagnóstico realizado por el técnico.
status: Estado actual de la reparación.
technicianId / technician: Técnico asignado.
partsUsed: Lista de piezas utilizadas en la reparación.
totalCost: Costo total de la reparación.
advancePayment: Adelanto pagado por el cliente.
receivedAt: Fecha y hora de recepción del equipo.
completedAt: Fecha en que se completó la reparación.
deliveredAt: Fecha en que se entregó al cliente.
createdAt / updatedAt: Fechas de auditoría.
@@index([status]) y @@index([receivedAt]): Optimización para reportes y dashboard.

---------------------------------------------------------------------------------------------------
RepairPart – Piezas utilizadas en reparaciones
Registra qué repuestos se usaron en cada reparación (permite descontar stock automáticamente).

id: Identificador único.
repairId / repair: Reparación asociada.
inventoryItemId / inventoryItem: Repuesto usado del inventario.
quantity: Cantidad utilizada.
price: Precio unitario al momento de la reparación.
@@unique([repairId, inventoryItemId]): Evita duplicar la misma pieza en una reparación.
onDelete: Cascade: Si se elimina la reparación, se eliminan automáticamente las piezas asociadas.

Enums

Role:
ADMIN → Control total del sistema
TECHNICIAN → Puede reparar y usar stock
VIEWER → Solo lectura

Category: Agrupa los repuestos (SCREEN, BATTERY, CAMERA, CHARGING_PORT, OTHER, PHONE, ACCESSORY, etc.)
RepairStatus: Define el flujo de trabajo:
RECEIVED, DIAGNOSIS, WAITING_PARTS, IN_REPAIR, READY, DELIVERED, CANCELLED