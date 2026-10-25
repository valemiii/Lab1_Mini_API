# Modelo ER APDAF SPORT · Grupo G1 · Laboratorio 3

Este diagrama representa el esquema relacional implementado en Prisma. Las relaciones se programan en este laboratorio; cada política de borrado protege la integridad del historial y del catálogo.

```mermaid
erDiagram
    USER ||--o| CUSTOMER : tiene_perfil
    CATEGORY o|--o{ PRODUCT : clasifica
    CUSTOMER ||--o{ ORDER : realiza
    ORDER ||--|{ ORDER_ITEM : contiene
    PRODUCT ||--o{ ORDER_ITEM : aparece_en

    USER {
        int id PK
        string email UK
        string password_hash
        string name
        enum role
        datetime created_at
    }
    CUSTOMER {
        int id PK
        string full_name
        string email UK
        string phone
        int user_id FK_UK
    }
    CATEGORY {
        int id PK
        string name UK
        string description
        boolean active
    }
    PRODUCT {
        int id PK
        string name
        string sku UK
        decimal price
        int stock
        int category_id FK
        string institution
        string category_label
        datetime created_at
    }
    ORDER {
        int id PK
        enum status
        decimal total
        int customer_id FK
        datetime created_at
    }
    ORDER_ITEM {
        int order_id PK_FK
        int product_id PK_FK
        int quantity
        decimal unit_price
    }
```

## Cardinalidad y borrado

| Relación | Cardinalidad | Clave foránea | `onDelete` | Justificación |
|---|---|---|---|---|
| User–Customer | 1:1 opcional para el usuario; obligatorio para Customer | `Customer.userId` único | `Cascade` | El perfil de cliente no tiene sentido sin su cuenta. Los usuarios ADMIN pueden no tener perfil comercial. |
| Category–Product | 1:N | `Product.categoryId` nullable | `SetNull` | Al borrar una categoría se conserva el producto y queda sin categoría relacionada. |
| Customer–Order | 1:N | `Order.customerId` | `Restrict` | Evita borrar un cliente que conserva historial de pedidos. |
| Order–OrderItem | 1:N | `OrderItem.orderId` | `Cascade` | Las líneas son dependientes y se eliminan con su pedido. |
| Product–OrderItem | 1:N | `OrderItem.productId` | `Restrict` | Impide borrar productos incluidos en el historial; también permite comprobar el 409. |
| Order–Product | N:M explícita | Tabla puente `OrderItem` | Por las dos FKs de la tabla puente | La tabla almacena cantidad y precio unitario al momento de la compra. |

## Mapeo y reglas

- Las tablas y columnas de negocio usan nombres snake_case mediante `@@map` y `@map`.
- `Role` y `OrderStatus` son enums. Los importes se almacenan como `Decimal(10,2)` y las fechas como `DateTime`.
- El SKU, correo de usuario y correo de perfil son únicos; `Customer.userId` es único para materializar 1:1.
- Los índices de `Order` permiten filtrar por cliente/fecha y estado/fecha.
- `stock` no puede quedar negativo: cada pedido lo decrementa con una actualización condicional dentro de una transacción.
- El precio de `OrderItem` es una instantánea; cambios futuros en el catálogo no alteran pedidos anteriores.
