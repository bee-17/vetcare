# VetCare — Sistema de Gestión de Veterinaria

Sistema simplificado con las funcionalidades más importantes de los 4 módulos que planteaste:
**Facturación, Historial Clínico, Citas y Doctores**, más un **Inventario** (petshop + medicamentos categorizados).

## Stack elegido (lo más simple y directo)

- **Backend**: Django + Django REST Framework (un solo backend, sin mezclar con Node — es la opción más simple y mantenible para este alcance) + JWT para el login.
- **Base de datos**: PostgreSQL (script SQL incluido para pgAdmin4).
- **Frontend admin**: React + Vite + Tailwind CSS, con la paleta de colores que diste.
- **Pruebas**: Colección de Postman con todos los endpoints.

## Estructura del proyecto

```
vetcare-system/
├── backend/               # Django + DRF (API REST)
│   ├── core/               # Modelos, vistas, serializers, urls
│   ├── vetcare/             # Configuración del proyecto
│   ├── requirements.txt
│   └── manage.py
├── database/
│   ├── schema.sql          # Ejecutar en pgAdmin4 (estructura de tablas)
│   └── seed.sql             # Datos de ejemplo (opcional)
├── frontend-admin/         # Panel administrativo (React + Tailwind)
└── postman/
    └── VetCare.postman_collection.json
```

## Funcionalidades incluidas (elegidas del listado que diste)

- **Login de admin** con panel dividido: imagen a la izquierda, formulario a la derecha.
- **Inventario**: productos de petshop y medicamentos, categorizados, con control de stock.
- **Módulo 1 — Facturación**: registrar factura/boleta, actualizar estado (pendiente → pagada), anular factura, y los 4 reportes que pediste (facturas del día, ingresos por mes, facturas por cliente, facturas anuladas).
- **Módulo 2 — Historial clínico**: registrar consulta, registrar vacuna (la receta se registra asociada a una consulta vía API/Postman), actualizar diagnóstico, y los 4 reportes (consultas por mascota, vacunas próximas a vencer, diagnósticos más frecuentes, consultas por veterinario).
- **Módulo 3 — Citas**: registrar, actualizar estado, cancelar, y los 4 reportes (citas del día, por veterinario, canceladas, pendientes por mascota).
- **Módulo 4 — Doctores**: registro de veterinarios + consultas de resumen (citas y consultas atendidas por doctor, citas del día por doctor).
- **Clientes y mascotas**: registrar/eliminar clientes y sus mascotas, necesario para poder generar citas, consultas y facturas desde el panel.

---

## 1. Configurar la base de datos (pgAdmin4)

1. Abre pgAdmin4 y crea una base de datos llamada `vetcare_db`.
2. Abre el **Query Tool** sobre `vetcare_db` y ejecuta `database/schema.sql`.
3. (Opcional) Ejecuta también `database/seed.sql` para tener datos de ejemplo.

> Alternativa recomendada: deja que Django cree las tablas automáticamente con `migrate` (ver paso 2) — usan los mismos nombres de tabla que `schema.sql`, así que ambos caminos son compatibles.

## 2. Levantar el backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configura las variables de conexión a tu base de datos (opcional, ya tiene valores por defecto):

```bash
export DB_NAME=vetcare_db
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

Crea las tablas y los datos de ejemplo:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data     # crea usuario admin + doctores + productos + ejemplo de cita/factura
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000/api/`.

**Usuario de prueba:** `admin` / **Clave:** `admin1234`

## 3. Levantar el frontend (React)

```bash
cd frontend-admin
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con `admin` / `admin1234`.

## 4. Probar la API con Postman

1. Importa `postman/VetCare.postman_collection.json` en Postman.
2. Ejecuta primero la request **Auth → Login (obtener token)**: guarda automáticamente el token en la variable `access_token` de la colección.
3. Todas las demás requests ya usan ese token automáticamente (Bearer Token a nivel de colección).

## Notas técnicas

- Los nombres de tabla en Django (`Meta.db_table`) coinciden exactamente con `schema.sql`, para que el diseño de base de datos sea consistente sin importar si usas migraciones o el script SQL directo.
- El módulo de "Receta médica" se gestiona por API (`/api/recetas/`) asociada a una consulta; no tiene pantalla propia en el frontend para mantenerlo simple, pero está lista para usarse en Postman o para agregarle una vista más adelante (todos los demás módulos ya tienen pantalla completa, incluyendo Clientes y Mascotas).
- Todos los endpoints (excepto login) requieren el token JWT (`Authorization: Bearer <token>`).
