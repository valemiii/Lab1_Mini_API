# Modelo ER del emprendimiento · Grupo GXX

> Actividad 3 de la sesión 4. Es la base del `schema.prisma` del Lab 2 y de las relaciones del Lab 3.

## Diagrama

Edítalo en https://mermaid.live (GitHub lo muestra como diagrama). Reemplaza el ejemplo por tus entidades.

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : realiza
    ORDER }o--o{ PRODUCT : contiene
    CUSTOMER {
        int id PK
        string fullName
        string email UK
        string phone "opcional"
    }
    ORDER {
        int id PK
        datetime date
        float total
        int customerId FK
    }
    PRODUCT {
        int id PK
        string name UK
        float price "mayor o igual a 0"
        int stock
    }
```

## Entidades

| Entidad | Atributos (tipo) | Clave primaria | Únicos / obligatorios / reglas |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

## Relaciones

| Entidad A | Cardinalidad (1:1, 1:N, N:M) | Entidad B | Ejemplo en una frase |
|---|---|---|---|
| | | | |
| | | | |

## ¿Qué se implementa en cada laboratorio?

- **Lab 2:** la entidad principal y una segunda entidad en `schema.prisma`, sin relaciones.
- **Lab 3:** las relaciones y las entidades restantes.
