# 🐾 VetCare — Sistema de Gestión de Veterinaria

> Gestiona citas, historial clínico, inventario y facturación de tu clínica veterinaria desde un solo panel.

Sistema con las funcionalidades más importantes de 4 módulos: **Facturación · Historial Clínico · Citas · Doctores**, más un módulo de **Inventario** (petshop + medicamentos) y otro de **Clientes y Mascotas**.

---

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Backend | Django + Django REST Framework + JWT |
| Base de datos | PostgreSQL |
| Frontend admin | React + Vite + Tailwind CSS |
| Pruebas de API | Colección de Postman |
| Extra académico | Objetos programables en Oracle (PL/SQL) |

---

## 📁 Estructura del proyecto

```
vetcare/
├── backend/                # Django + DRF (API REST)
│   ├── core/                 # Modelos, vistas, serializers, urls, seed_data
│   ├── vetcare/               # Configuración del proyecto (settings, urls)
│   ├── requirements.txt
│   └── manage.py
├── database/
│   ├── schema.sql           # Estructura de tablas — ejecutar en pgAdmin4
│   └── seed.sql              # Datos de ejemplo (opcional)
├── docs/
│   └── VetCare_Objetos_Programables_Oracle.docx   # Documento de la exposición Oracle
├── frontend-admin/          # Panel administrativo (React + Tailwind)
│   └── src/pages/             # Dashboard, Citas, HistorialClinico, Facturacion,
│                                Inventario, Doctores, ClientesMascotas, Login
├── oracle/
│   └── vetcare_citas_oracle.sql   # Procedimientos, funciones, triggers y package (módulo Citas)
├── postman/
│   └── VetCare.postman_collection.json
└── README.md
```

---

## ✨ Funcionalidades

- 🔐 **Login de admin** — pantalla dividida con imagen, autenticación JWT.
- 🐶 **Clientes y mascotas** — registrar/eliminar clientes y sus mascotas.
- 📦 **Inventario** — productos de petshop y medicamentos, categorizados, con control de stock.
- 🧾 **Facturación** — registrar factura/boleta, cambiar estado (pendiente → pagada), anular, + 4 reportes (del día, ingresos por mes, por cliente, anuladas).
- 🩺 **Historial clínico** — registrar consulta, vacuna, actualizar diagnóstico, + 4 reportes (por mascota, vacunas por vencer, diagnósticos frecuentes, por veterinario).
- 📅 **Citas** — registrar, actualizar estado, cancelar, + 4 reportes (del día, por veterinario, canceladas, pendientes por mascota).
- 👩‍⚕️ **Doctores** — registro de veterinarios + resumen de citas/consultas atendidas.

---

## 🚀 Puesta en marcha

### 1️⃣ Base de datos (pgAdmin4)

Elige **una** de estas dos opciones:

- **Opción A (recomendada):** deja que Django cree las tablas con `migrate` (paso 2).
- **Opción B (manual):** crea la BD `vetcare_db` en pgAdmin4, abre el Query Tool y ejecuta `database/schema.sql` (y `database/seed.sql` si quieres datos de ejemplo). Si después corres Django sobre esta base, usa `migrate --fake-initial` para que no intente recrear tablas ya existentes.

### 2️⃣ Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Variables de conexión (opcional, ya trae valores por defecto):

```bash
export DB_NAME=vetcare_db
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432
```

Migraciones + datos de ejemplo + servidor:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data     # crea admin + doctores + productos + ejemplo de cita/factura
python manage.py runserver
```

API disponible en `http://localhost:8000/api/`.

> 🔑 **Usuario de prueba:** `admin` &nbsp;·&nbsp; **Clave:** `admin1234`

### 3️⃣ Frontend (React)

```bash
cd frontend-admin
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con `admin` / `admin1234`.

### 4️⃣ Pruebas con Postman

1. Importa `postman/VetCare.postman_collection.json`.
2. Corre **Auth → Login (obtener token)** — el token se guarda solo en la variable `access_token` de la colección (no hay que copiarlo a mano).
3. Todas las demás requests ya usan ese token automáticamente.

**Orden recomendado para generar datos de prueba de punta a punta:**

1. Auth → Login
2. Doctores → Registrar veterinario
3. Clientes y Mascotas → Registrar cliente → Registrar mascota
4. Inventario → Registrar categoría → Registrar producto
5. Citas → Registrar cita → Actualizar estado → Reportes
6. Historial clínico → Registrar consulta → Registrar vacuna → Reportes
7. Facturación → Registrar factura → Actualizar estado → Reportes
8. Dashboard → Resumen general

### 5️⃣ Extra académico: objetos programables en Oracle

`oracle/vetcare_citas_oracle.sql` contiene el módulo de Citas migrado a Oracle con procedimientos, funciones, triggers y un package, listo para correr en SQL Developer (**Archivo → Abrir**, luego **F5 / Ejecutar Script**). El documento de la exposición está en `docs/VetCare_Objetos_Programables_Oracle.docx`.

---

## 🛠️ Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `could not connect to server` | PostgreSQL no está corriendo o credenciales no coinciden | Verifica el servicio de Postgres y `DB_USER`/`DB_PASSWORD` |
| `relation "veterinarios" already exists` en `migrate` | Ya corriste `schema.sql` a mano (Opción B) | Usa `python manage.py migrate --fake-initial` |
| `401 Unauthorized` en Postman | Token vencido o no generado | Vuelve a correr **Auth → Login** (dura 8 horas) |
| Frontend sin datos / error CORS | Backend apagado o en otro puerto | Confirma `runserver` activo en :8000 y `.env` del frontend apuntando a `http://localhost:8000/api` |
| Tailwind roto en `npm run dev` | Falta `npm install` | Ejecuta `npm install` dentro de `frontend-admin` primero |

---

## 📝 Notas técnicas

- Los nombres de tabla en Django (`Meta.db_table`) coinciden con `database/schema.sql`, así el diseño es consistente sin importar el camino elegido.
- El módulo de "Receta médica" se gestiona por API (`/api/recetas/`) asociada a una consulta; no tiene pantalla propia en el frontend, pero está lista para Postman o para agregarle una vista después.
- Todos los endpoints (excepto login) requieren `Authorization: Bearer <token>`.
