CREATE DATABASE IF NOT EXISTS tp3 CHARACTER SET utf8mb4 COLLATE utf8mb4_es_0900_ai_ci;

USE tp3;

DROP TABLE IF EXISTS viajes;

DROP TABLE IF EXISTS conductores;

DROP TABLE IF EXISTS vehiculos;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(60) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  UNIQUE KEY uk_usuarios_email (email)
);

CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(7) NOT NULL,
  anio SMALLINT NOT NULL,
  capacidad_carga DECIMAL(8, 2) NOT NULL,
  UNIQUE KEY uk_vehiculos_patente (patente)
);

CREATE TABLE conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  documento VARCHAR(8) NOT NULL,
  licencia VARCHAR(20) NOT NULL,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  UNIQUE KEY uk_conductores_documento (documento),
  UNIQUE KEY uk_conductores_licencia (licencia)
);

CREATE TABLE viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(8, 2) NOT NULL,
  observaciones VARCHAR(255),
  CONSTRAINT fk_viajes_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_viajes_conductor FOREIGN KEY (conductor_id) REFERENCES conductores (id) ON DELETE RESTRICT ON UPDATE CASCADE
);