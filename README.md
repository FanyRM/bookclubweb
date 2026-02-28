# 📚 Páginas — Club del Libro

Aplicación web completa para comunidades de lectura. Construida con Flask + MongoDB + Python.

## Características

- 👤 **Perfiles de usuario** — CRUD completo, foto en base64, etiquetas, descripción
- 📖 **Biblioteca de libros** — Subir libros con portada, descripción, calificación y links
- ✍️ **Reseñas y críticas** — Editor rich text (Quill.js), calificación con estrellas
- 💬 **Foros** — Por libro y por reunión
- 📅 **Reuniones** — Con mapa (OpenStreetMap), recurrentes o puntuales
- 🗺️ **Mapa integrado** — Para cada reunión con lat/lng

## Estructura del proyecto

```
bookclub/
├── app.py                  # Aplicación Flask principal
├── requirements.txt
├── routes/
│   ├── auth.py             # Autenticación (login/logout/sesión)
│   ├── usuarios.py         # CRUD de usuarios
│   ├── libros.py           # CRUD de libros
│   ├── criticas.py         # CRUD de reseñas/críticas
│   ├── foros.py            # Mensajes de foro
│   ├── reuniones.py        # CRUD de reuniones
│   └── pages.py            # Rutas de páginas HTML
└── templates/
    └── index.html          # SPA (Single Page Application)
```

## Requisitos

- Python 3.10+
- MongoDB corriendo en localhost:27017

## Instalación y ejecución

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Asegurarte de que MongoDB esté corriendo
# (mongod o Docker: docker run -d -p 27017:27017 mongo)

# 3. Ejecutar la app
python app.py
```

La app estará en: http://localhost:5000

## Variables de entorno (opcionales)

```
MONGO_URI=mongodb://localhost:27017/bookclub
SECRET_KEY=tu-clave-secreta
```

## API Endpoints

### Autenticación
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

### Usuarios
- POST   /api/usuarios/
- GET    /api/usuarios/
- GET    /api/usuarios/:id
- PUT    /api/usuarios/:id
- DELETE /api/usuarios/:id

### Libros
- POST   /api/libros/
- GET    /api/libros/
- GET    /api/libros/:id
- PUT    /api/libros/:id
- DELETE /api/libros/:id

### Críticas/Reseñas
- POST   /api/criticas/
- GET    /api/criticas/?idLibro=...
- GET    /api/criticas/:id
- PUT    /api/criticas/:id
- DELETE /api/criticas/:id

### Foros
- GET  /api/foros/mensajes?tipo=libro|reunion&refId=...
- POST /api/foros/mensajes
- DELETE /api/foros/mensajes/:id

### Reuniones
- POST   /api/reuniones/
- GET    /api/reuniones/
- GET    /api/reuniones/:id
- PUT    /api/reuniones/:id
- DELETE /api/reuniones/:id

## Notas técnicas

- Las imágenes se guardan en base64 directamente en MongoDB
- Contraseñas hasheadas con SHA-256
- Sesiones manejadas por Flask (server-side sessions)
- Frontend SPA con JavaScript vanilla (sin frameworks)
- Editor rich text con Quill.js
- Mapas con OpenStreetMap (sin API key)
