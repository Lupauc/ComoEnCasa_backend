# Backend_ComoEnCasa

## Descripción
`Backend_ComoEnCasa` es la API REST de la aplicación ComoEnCasa. Está desarrollada con Node.js, Express y TypeScript, y se encarga de la lógica de negocio, autenticación, persistencia de datos y servicios auxiliares como subida de imágenes y envío de correos.

Esta parte conecta con MongoDB y da soporte tanto a la parte pública de la web como al panel de administración.

## Objetivo del backend
El backend tiene como objetivo:

- gestionar usuarios y autenticación
- controlar productos, categorías y pedidos
- guardar la información del restaurante
- enviar correos de verificación y recuperación de contraseña
- servir una API clara para el frontend

## Tecnologías utilizadas
- Node.js
- Express
- TypeScript
- MongoDB con Mongoose
- JWT
- Passport Google OAuth
- Cloudinary
- Resend
- Multer
- Helmet
- Morgan
- CORS

## Estructura principal
```text
Backend_ComoEnCasa/
├── src/
│   ├── config/        # Configuración general
│   ├── controllers/   # Lógica de cada recurso
│   ├── middlewares/   # Middlewares de auth, errores y subida
│   ├── models/        # Modelos de MongoDB
│   ├── routes/        # Rutas de la API
│   ├── services/      # Servicios externos como email o Cloudinary
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Funcionalidades principales
- Registro de usuarios
- Login con email y contraseña
- Login con Google
- Verificación de email
- Recuperación y cambio de contraseña
- Avatar por defecto al crear cuenta
- Gestión de perfil de usuario
- Gestión de categorías
- Gestión de productos
- Gestión de pedidos
- Gestión de mensajes de contacto
- Gestión de datos del restaurante
- Subida de imágenes a Cloudinary
- Envío de correos mediante Resend
- Colección de Postman para probar la API

## Requisitos previos
- Node.js instalado
- npm instalado
- MongoDB en local o en la nube
- Credenciales de Cloudinary
- Credenciales de Resend
- Credenciales de Google OAuth si se quiere usar acceso con Google

## Instalación
Desde la carpeta del backend:

```bash
cd Backend_ComoEnCasa
npm install
```

## Variables de entorno
Puedes crear un archivo `.env` a partir de `.env.example`.

```env
PORT=5050
NODE_ENV=development
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
RESEND_API_KEY=tu_resend_api_key
EMAIL_FROM=ComoEnCasa <noreply@comoencasarivas.com>
```

El archivo `.env` real no debe subirse al repositorio. Solo se deja versionado `.env.example` como plantilla.

## Scripts disponibles
- `npm run dev`: ejecuta el backend en desarrollo con recarga automática
- `npm run build`: compila TypeScript
- `npm run lint`: comprueba tipos con TypeScript sin generar build
- `npm start`: arranca la versión compilada

## Ejecución en desarrollo
```bash
npm run dev
```

La API quedará normalmente disponible en:

```text
http://localhost:5050/api
```

## Endpoints importantes
### Autenticación
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/verify-email/:token`
- `/api/auth/resend-verification`
- `/api/auth/forgot-password`
- `/api/auth/reset-password/:token`
- `/api/auth/google`
- `/api/auth/me`

### Usuarios
- `/api/users/profile`
- `/api/users/profile/avatar`
- `/api/users/change-password`
- `/api/users/:id`

### Categorías
- `/api/categories`
- `/api/categories/:id`
- `/api/categories/reorder`

### Productos
- `/api/products`
- `/api/products/menu`
- `/api/products/:id`
- `/api/products/:id/image`
- `/api/products/:id/availability`
- `/api/products/reorder`

### Pedidos
- `/api/orders`
- `/api/orders/my-orders`
- `/api/orders/my-orders/:id`
- `/api/orders/:id`
- `/api/orders/:id/status`

### Restaurante
- `/api/restaurant`
- `/api/restaurant/gallery`

### Contacto
- `/api/contact`
- `/api/contact/:id/read`
- `/api/contact/:id`

### Estado
- `/api/health`

## Colección de Postman
En la carpeta del backend se incluye el archivo `ComoEnCasa API.postman_collection.json`.

La colección ya está preparada para:
- registro y login
- verificación y recuperación de contraseña
- login con Google
- CRUD principal de categorías, productos y pedidos
- gestión del restaurante
- gestión de mensajes de contacto

La variable `base_url` de la colección está configurada para:

```text
http://localhost:5050/api
```

## Algunos detalles que ya están resueltos
- El registro de usuario asigna un avatar por defecto si el usuario se crea con email y contraseña
- El backend monta la ruta de contacto y guarda los mensajes en MongoDB
- El login con Google y el login normal usan el mismo sistema de JWT
- La API separa rutas públicas, protegidas y de administrador según el recurso

## Falta modelo entidad-relacion de la base de datos

## Decisiones tomadas en esta parte
- Organizar el backend por capas: rutas, controladores, servicios y modelos
- Separar la configuración técnica en `config`
- Usar JWT para autenticación del frontend
- Añadir middlewares para control de acceso y gestión de errores
- Delegar subida de imágenes y correos a servicios externos reales

## Posibles mejoras futuras
- Añadir tests automáticos de controladores y servicios
- Añadir validaciones más completas en todos los endpoints
- Mejorar logs y monitorización
- Añadir paginación y filtros más avanzados

## Conclusión
El backend de ComoEnCasa centraliza la lógica principal de la aplicación y ofrece una API reutilizable para el frontend. A nivel académico, esta parte del proyecto permite trabajar autenticación, base de datos, servicios externos y organización por capas sobre un caso real.
