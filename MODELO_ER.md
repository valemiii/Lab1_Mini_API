# Modelo entidad-relación · Lab 3 · APDAF SPORT

```text
User 1 ──── 1 Customer 1 ──── N Order 1 ──── N OrderItem N ──── 1 Product N ──── 0..1 Category
                                   └──────────── N:M Order ↔ Product ───────────┘
```

## Entidades

| Entidad | Tabla | Campos clave | Tipos destacados |
|---|---|---|---|
| User | `users` | `id`, `email` (único), `password_hash`, `role` | `Role` (enum USER/ADMIN), `DateTime` |
| Customer | `customers` | `id`, `user_id` (único → 1:1), `email` (único) | `VarChar(15)` para teléfono |
| Category | `categories` | `id`, `name` (único), `active` | `Boolean` |
| Product | `products` | `id`, `sku` (único), `price`, `stock`, `category_id` | `Decimal(10,2)` para dinero |
| Order | `orders` | `id`, `customer_id`, `status`, `total`, `created_at` | `OrderStatus` (enum), `Decimal(10,2)`, `DateTime` |
| OrderItem | `order_items` | PK compuesta (`order_id`, `product_id`), `quantity`, `unit_price` | `Decimal(10,2)` |

## Relaciones y decisión de `onDelete`

| Relación | Cardinalidad | FK | onDelete | Justificación |
|---|---|---|---|---|
| User → Customer | 1:1 | `customers.user_id` `@unique` | **Cascade** | El perfil de cliente no tiene sentido sin su cuenta: si se elimina el usuario, su perfil se elimina con él. |
| Customer → Order | 1:N | `orders.customer_id` | **Restrict** | Los pedidos son historial comercial (ventas, reportes): no se permite borrar un cliente que ya compró; la API responde 409. |
| Category → Product | 1:N | `products.category_id` (opcional) | **SetNull** | Si se elimina una categoría, los uniformes siguen en el catálogo, solo quedan sin categoría. |
| Order → OrderItem | 1:N (lado Order de la N:M) | `order_items.order_id` | **Cascade** | Las líneas solo existen dentro de su pedido: borrar el pedido borra sus líneas. |
| Product → OrderItem | 1:N (lado Product de la N:M) | `order_items.product_id` | **Restrict** | Un producto que aparece en pedidos no se puede borrar, para no perder el detalle ni el precio histórico; `DELETE /api/products/:id` responde 409. |

**N:M explícita:** Order ↔ Product usa la tabla intermedia `OrderItem` porque guarda datos propios: `quantity` y `unitPrice` (precio al momento de la compra, aunque luego cambie el precio del producto).

## Mapeo

- **Enums:** `Role` (USER, ADMIN) y `OrderStatus` (PENDING, DELIVERED, CANCELLED).
- **Tipos:** `Decimal(10,2)` para `price`, `total` y `unit_price` (evita errores de redondeo de `Float`); `DateTime` para `created_at`.
- **Índices y únicos:** `@@id([orderId, productId])` (clave compuesta), `@@index([status, createdAt])` y `@@index([customerId, createdAt])` (compuestos, usados por el listado admin y "mis pedidos"), `@@index([categoryId])`; únicos en `users.email`, `customers.email`, `customers.user_id`, `products.sku` y `categories.name`.
- **Nombres:** `@map` / `@@map` en snake_case (`full_name`, `password_hash`, `order_items`…).

## Seed

`prisma/seed.js` borra en orden inverso a las FK (OrderItem → Order → Customer → User → Product → Category) y crea categorías, productos, el usuario ADMIN, un cliente y un pedido de ejemplo.
