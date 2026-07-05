-- =============================================================
-- VETCARE - Esquema de base de datos para pgAdmin4 / PostgreSQL
-- =============================================================
-- Instrucciones:
-- 1. Crear una base de datos llamada "vetcare_db" en pgAdmin4.
-- 2. Abrir el Query Tool sobre "vetcare_db" y ejecutar este script completo.
-- 3. Esto crea exactamente las mismas tablas que Django generará al
--    correr "python manage.py migrate" (los nombres de tabla coinciden
--    con el Meta.db_table de cada modelo), así que puedes usar este
--    script solo como referencia/documentación de diseño, o ejecutarlo
--    manualmente y luego correr Django con --fake-initial.
-- =============================================================

CREATE TABLE IF NOT EXISTS veterinarios (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(254),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'DNI',
    num_documento VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(254),
    direccion VARCHAR(200),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mascotas (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    sexo VARCHAR(1) NOT NULL DEFAULT 'M' CHECK (sexo IN ('M', 'H')),
    fecha_nacimiento DATE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias_producto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('petshop', 'medicamento')),
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL REFERENCES categorias_producto(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('petshop', 'medicamento')),
    descripcion VARCHAR(250),
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    fecha_vencimiento DATE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
    id BIGSERIAL PRIMARY KEY,
    mascota_id BIGINT NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
    veterinario_id BIGINT NOT NULL REFERENCES veterinarios(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo VARCHAR(200),
    estado VARCHAR(15) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmada', 'atendida', 'cancelada')),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultas (
    id BIGSERIAL PRIMARY KEY,
    cita_id BIGINT REFERENCES citas(id) ON DELETE SET NULL,
    mascota_id BIGINT NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
    veterinario_id BIGINT NOT NULL REFERENCES veterinarios(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    motivo_consulta VARCHAR(200),
    diagnostico VARCHAR(250) NOT NULL,
    tratamiento TEXT,
    observaciones TEXT
);

CREATE TABLE IF NOT EXISTS recetas (
    id BIGSERIAL PRIMARY KEY,
    consulta_id BIGINT NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    medicamento_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    duracion VARCHAR(100) NOT NULL,
    indicaciones TEXT
);

CREATE TABLE IF NOT EXISTS vacunas (
    id BIGSERIAL PRIMARY KEY,
    mascota_id BIGINT NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
    veterinario_id BIGINT NOT NULL REFERENCES veterinarios(id) ON DELETE RESTRICT,
    nombre_vacuna VARCHAR(150) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    fecha_proxima DATE,
    observaciones VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS facturas (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'boleta'
        CHECK (tipo_documento IN ('factura', 'boleta')),
    serie VARCHAR(10) NOT NULL DEFAULT 'F001',
    numero VARCHAR(20) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    igv NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(15) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'pagada', 'anulada')),
    UNIQUE (serie, numero)
);

CREATE TABLE IF NOT EXISTS detalle_facturas (
    id BIGSERIAL PRIMARY KEY,
    factura_id BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id) ON DELETE SET NULL,
    descripcion VARCHAR(200) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- =============================================================
-- Índices útiles para las consultas / reportes más frecuentes
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_vacunas_proxima ON vacunas(fecha_proxima);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);

-- =============================================================
-- CONSULTAS DE REFERENCIA (las mismas que expone la API REST)
-- =============================================================

-- MÓDULO 1: FACTURACIÓN -----------------------------------------------------

-- Reporte de facturas del día
-- SELECT * FROM facturas WHERE fecha_emision = CURRENT_DATE;

-- Reporte de ingresos por mes
-- SELECT DATE_TRUNC('month', fecha_emision) AS mes,
--        SUM(total) AS total_ingresos, COUNT(*) AS cantidad_facturas
-- FROM facturas WHERE estado = 'pagada'
-- GROUP BY mes ORDER BY mes DESC;

-- Reporte de facturas por cliente
-- SELECT f.* FROM facturas f
-- JOIN clientes c ON c.id = f.cliente_id
-- WHERE f.cliente_id = 1;

-- Reporte de facturas anuladas
-- SELECT * FROM facturas WHERE estado = 'anulada';

-- MÓDULO 2: HISTORIAL CLÍNICO -------------------------------------------------

-- Reporte de consultas por mascota
-- SELECT * FROM consultas WHERE mascota_id = 1 ORDER BY fecha DESC;

-- Reporte de vacunas próximas a vencer (siguientes 30 días)
-- SELECT v.*, m.nombre AS mascota
-- FROM vacunas v JOIN mascotas m ON m.id = v.mascota_id
-- WHERE fecha_proxima BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

-- Reporte de diagnósticos más frecuentes
-- SELECT diagnostico, COUNT(*) AS veces
-- FROM consultas GROUP BY diagnostico ORDER BY veces DESC LIMIT 20;

-- Reporte de consultas por veterinario
-- SELECT * FROM consultas WHERE veterinario_id = 1 ORDER BY fecha DESC;

-- MÓDULO 3: CITAS -------------------------------------------------------------

-- Reporte de citas del día
-- SELECT * FROM citas WHERE fecha = CURRENT_DATE;

-- Reporte de citas por veterinario
-- SELECT * FROM citas WHERE veterinario_id = 1 ORDER BY fecha DESC;

-- Reporte de citas canceladas
-- SELECT * FROM citas WHERE estado = 'cancelada';

-- Reporte de citas pendientes por mascota
-- SELECT * FROM citas WHERE mascota_id = 1 AND estado = 'pendiente';

-- MÓDULO 4: DOCTORES -----------------------------------------------------------

-- Resumen por doctor: total de citas y consultas atendidas
-- SELECT v.id, v.nombres, v.apellidos, v.especialidad,
--        COUNT(DISTINCT c.id) AS total_citas,
--        COUNT(DISTINCT co.id) AS total_consultas
-- FROM veterinarios v
-- LEFT JOIN citas c ON c.veterinario_id = v.id
-- LEFT JOIN consultas co ON co.veterinario_id = v.id
-- GROUP BY v.id, v.nombres, v.apellidos, v.especialidad;

-- Citas del día agrupadas por doctor
-- SELECT v.nombres, v.apellidos, COUNT(c.id) AS total
-- FROM citas c JOIN veterinarios v ON v.id = c.veterinario_id
-- WHERE c.fecha = CURRENT_DATE
-- GROUP BY v.nombres, v.apellidos ORDER BY total DESC;
