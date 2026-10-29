# Modelo entidad-relación · Lab 3

```text
User 1 ─── 0..1 Customer 1 ─── N Order 1 ─── N OrderItem N ─── 1 Product
```

- `User`/`Customer`: perfil 1:1 mediante `userId @unique`, `onDelete: Cascade`.
- `Customer`/`Order`: un cliente puede tener muchos pedidos, `onDelete: Restrict`.
- `Order`/`Product`: N:M explícita con `OrderItem`; conserva cantidad y precio histórico.
- `OrderStatus` y `Role` son enums; precios usan `Decimal`; las fechas usan `DateTime`.
- Índices en `Product.category`, `Order.customerId` y `[status, createdAt]`; email y userId son únicos.
