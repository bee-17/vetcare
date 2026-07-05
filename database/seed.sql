-- =============================================================
-- VETCARE - Datos de ejemplo (opcional)
-- Ejecutar DESPUÉS de schema.sql
-- Nota: si vas a usar Django (recomendado), en vez de este archivo
-- usa: python manage.py seed_data  (crea también el usuario admin)
-- =============================================================

INSERT INTO veterinarios (nombres, apellidos, especialidad, telefono, email)
VALUES
  ('Lucía', 'Fernández', 'Medicina General', '999111222', 'lucia.fernandez@vetcare.com'),
  ('Marco', 'Ruiz', 'Cirugía', '999333444', 'marco.ruiz@vetcare.com')
ON CONFLICT DO NOTHING;

INSERT INTO categorias_producto (nombre, tipo, descripcion) VALUES
  ('Alimentos', 'petshop', 'Alimentos balanceados para mascotas'),
  ('Accesorios', 'petshop', 'Correas, juguetes, camas'),
  ('Antibióticos', 'medicamento', 'Medicamentos antibióticos'),
  ('Vacunas', 'medicamento', 'Vacunas veterinarias')
ON CONFLICT DO NOTHING;

INSERT INTO productos (categoria_id, nombre, tipo, descripcion, precio, stock, stock_minimo, fecha_vencimiento)
SELECT c.id, 'Alimento Perro Adulto 15kg', 'petshop', 'Alimento balanceado premium', 180.00, 25, 5, NULL
FROM categorias_producto c WHERE c.nombre = 'Alimentos'
ON CONFLICT DO NOTHING;

INSERT INTO productos (categoria_id, nombre, tipo, descripcion, precio, stock, stock_minimo, fecha_vencimiento)
SELECT c.id, 'Correa retráctil', 'petshop', 'Correa retráctil 5m', 45.00, 15, 3, NULL
FROM categorias_producto c WHERE c.nombre = 'Accesorios'
ON CONFLICT DO NOTHING;

INSERT INTO productos (categoria_id, nombre, tipo, descripcion, precio, stock, stock_minimo, fecha_vencimiento)
SELECT c.id, 'Amoxicilina 250mg', 'medicamento', 'Antibiótico de amplio espectro', 25.00, 40, 10, CURRENT_DATE + INTERVAL '200 days'
FROM categorias_producto c WHERE c.nombre = 'Antibióticos'
ON CONFLICT DO NOTHING;

INSERT INTO productos (categoria_id, nombre, tipo, descripcion, precio, stock, stock_minimo, fecha_vencimiento)
SELECT c.id, 'Vacuna Antirrábica', 'medicamento', 'Vacuna contra la rabia', 60.00, 30, 5, CURRENT_DATE + INTERVAL '15 days'
FROM categorias_producto c WHERE c.nombre = 'Vacunas'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nombres, apellidos, tipo_documento, num_documento, telefono, email, direccion)
VALUES ('Diro', 'Carrasco', 'DNI', '45678912', '987654321', 'diro@example.com', 'Lima, Perú')
ON CONFLICT DO NOTHING;

INSERT INTO mascotas (cliente_id, nombre, especie, raza, sexo, fecha_nacimiento)
SELECT c.id, 'Rocky', 'Perro', 'Labrador', 'M', '2021-05-10'
FROM clientes c WHERE c.num_documento = '45678912'
ON CONFLICT DO NOTHING;
