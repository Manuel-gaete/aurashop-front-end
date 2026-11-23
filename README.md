# AuraShop – Frontend


Contraseña para todos los usuarios: Aura#2026demo

Front de la tienda AuraShop hecho con React + Vite. Misma arquitectura que `petcare-frontend`:
`services/api.js` (llamadas HTTP) → `App.jsx` (pantallas) → CSS propio, con el proxy `/api` → `localhost:8080`.

## Cómo ejecutarlo
1. Levantar el backend (`.\mvnw.cmd spring-boot:run`) → queda en `http://localhost:8080`.
2. En esta carpeta:
   ```
   npm install
   npm run dev
   ```
3. Abrir `http://localhost:5173`. (Debe ser el puerto 5173: el CORS del backend solo permite ese origen.)

## Pantallas según rol
| Pantalla | Quién la ve |
|---|---|
| Tienda, carrito, login, registro | Todos |
| Mis órdenes | Usuario autenticado |
| Productos y Categorías (CRUD) | ADMINISTRADOR, EDITOR_PRODUCTOS |
| Usuarios | ADMINISTRADOR (CRUD), SOPORTE (solo lectura) |
| Todas las órdenes | ADMINISTRADOR, SOPORTE |

## Estructura
```
src/
├── main.jsx              punto de entrada (monta los contextos y App)
├── App.jsx               barra superior, menú por rol y cambio de pantallas
├── services/api.js       TODAS las llamadas al backend + JWT + refresh automático
├── context/              AuthContext (sesión y permisos) y CartContext (carrito)
├── components/           una pantalla o pieza por archivo
└── utils/format.js       formato CLP, fechas y nombres de roles
```
