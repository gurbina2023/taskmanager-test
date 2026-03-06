-- Script SQL - Prueba Técnica Desarrollador Junior
-- Esquema relacional, datos de ejemplo y consultas.

-- 1. CREACIÓN DE TABLAS

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'USER'))
);

CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'COMPLETADA')),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento TIMESTAMP NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  CONSTRAINT chk_vencimiento_posterior
    CHECK (fecha_vencimiento >= fecha_creacion)
);

-- 2. INSERCIÓN DE USUARIOS (al menos 3)

INSERT INTO usuarios (id, nombre_usuario, contrasena, rol) VALUES
  (1, 'admin', 'admin123', 'ADMIN'),
  (2, 'juan',  'juan123',  'USER'),
  (3, 'ana',   'ana123',   'USER');

-- 3. INSERCIÓN DE TAREAS (al menos 5)

INSERT INTO tareas (
  id, titulo, estado, fecha_creacion, fecha_vencimiento, usuario_id
) VALUES
  (1, 'Revisar tablero de tareas', 'PENDIENTE',
      '2026-03-01 09:00:00', '2026-03-07 18:00:00', 1),
  (2, 'Preparar informe semanal',  'PENDIENTE',
      '2026-03-02 10:00:00', '2026-03-05 17:00:00', 2),
  (3, 'Actualizar documentación',  'PENDIENTE',
      '2026-02-25 11:30:00', '2026-03-01 12:00:00', 2),
  (4, 'Llamar a cliente X',        'PENDIENTE',
      '2026-02-28 15:00:00', '2026-03-03 16:00:00', 3),
  (5, 'Organizar archivos',        'COMPLETADA',
      '2026-02-20 08:30:00', '2026-02-25 18:00:00', 3);


-- 4. CONSULTAS REQUERIDAS

-- 4.1 Listado completo de tareas ordenadas por proximidad de vencimiento.

SELECT
  t.id,
  t.titulo,
  t.estado,
  t.fecha_creacion,
  t.fecha_vencimiento,
  u.nombre_usuario AS asignado_a
FROM tareas t
JOIN usuarios u ON u.id = t.usuario_id
ORDER BY t.fecha_vencimiento ASC;


-- 4.2 Conteo de tareas pendientes y completadas agrupadas por usuario.

SELECT
  u.nombre_usuario,
  t.estado,
  COUNT(*) AS cantidad_tareas
FROM tareas t
JOIN usuarios u ON u.id = t.usuario_id
GROUP BY u.nombre_usuario, t.estado
ORDER BY u.nombre_usuario, t.estado;


-- 4.3 Tareas atrasadas (estado pendiente y fecha_vencimiento < fecha actual).

SELECT
  t.id,
  t.titulo,
  t.estado,
  t.fecha_vencimiento,
  u.nombre_usuario AS asignado_a
FROM tareas t
JOIN usuarios u ON u.id = t.usuario_id
WHERE
  t.estado = 'PENDIENTE'
  AND t.fecha_vencimiento < NOW()
ORDER BY t.fecha_vencimiento ASC;

