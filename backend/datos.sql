-- Datos de prueba. Ejecutar despues de database.sql:
--   mysql -u root -p < database.sql
--   mysql -u root -p < datos.sql

USE tp3;

INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES
  ('Mercedes-Benz', 'Sprinter', 'AB123CD', 2021, 1500.00),
  ('Iveco', 'Daily', 'AC456EF', 2023, 3500.00),
  ('Ford', 'Cargo 1723', 'KLM456', 2012, 12000.00);

INSERT INTO conductores
  (nombre, apellido, documento, licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
VALUES
  ('Juan', 'Pérez', '30123456', 'LIC-30123456', '2020-03-10', '2027-03-10'),
  ('María', 'González', '32654987', 'LIC-32654987', '2019-07-22', '2026-12-31'),
  ('Carlos', 'Núñez', '28456123', 'LIC-28456123', '2015-01-15', '2025-01-15');

INSERT INTO viajes
  (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
VALUES
  (1, 1, '2026-10-01 06:00:00', '2026-10-01 18:30:00', 'La Rioja', 'Córdoba', 460.00, NULL),
  (2, 2, '2026-10-05 07:15:00', '2026-10-05 10:45:00', 'La Rioja', 'Catamarca', 155.50, 'Carga refrigerada'),
  (1, 2, '2026-10-12 05:30:00', '2026-10-13 09:00:00', 'Córdoba', 'Rosario', 400.00, NULL),
  (3, 1, '2026-11-02 08:00:00', '2026-11-02 20:00:00', 'La Rioja', 'San Juan', 450.00, 'Demora en ruta 150');
