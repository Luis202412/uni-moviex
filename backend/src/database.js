const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'iuda_movies.db'));

// Habilitar WAL mode para mejor rendimiento
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS generos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado VARCHAR(10) NOT NULL DEFAULT 'Activo' CHECK(estado IN ('Activo', 'Inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT
  );

  CREATE TABLE IF NOT EXISTS directores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres VARCHAR(200) NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'Activo' CHECK(estado IN ('Activo', 'Inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS productoras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    estado VARCHAR(10) NOT NULL DEFAULT 'Activo' CHECK(estado IN ('Activo', 'Inactivo')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    slogan VARCHAR(300),
    descripcion TEXT
  );

  CREATE TABLE IF NOT EXISTS tipos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial VARCHAR(100) NOT NULL UNIQUE,
    titulo VARCHAR(300) NOT NULL,
    sinopsis TEXT,
    url VARCHAR(500) NOT NULL UNIQUE,
    imagen_portada VARCHAR(500),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    anio_estreno INTEGER,
    genero_id INTEGER NOT NULL,
    director_id INTEGER NOT NULL,
    productora_id INTEGER NOT NULL,
    tipo_id INTEGER NOT NULL,
    FOREIGN KEY (genero_id) REFERENCES generos(id),
    FOREIGN KEY (director_id) REFERENCES directores(id),
    FOREIGN KEY (productora_id) REFERENCES productoras(id),
    FOREIGN KEY (tipo_id) REFERENCES tipos(id)
  );
`);

// Insertar datos iniciales si no existen
const generoCount = db.prepare('SELECT COUNT(*) as count FROM generos').get();
if (generoCount.count === 0) {
  const insertGenero = db.prepare('INSERT INTO generos (nombre, descripcion) VALUES (?, ?)');
  insertGenero.run('Acción', 'Películas con escenas de acción y aventura intensa');
  insertGenero.run('Aventura', 'Películas de exploración y descubrimiento');
  insertGenero.run('Ciencia Ficción', 'Películas basadas en conceptos científicos y futuristas');
  insertGenero.run('Drama', 'Películas con narrativas emocionales profundas');
  insertGenero.run('Terror', 'Películas de suspenso y horror');
}

const tipoCount = db.prepare('SELECT COUNT(*) as count FROM tipos').get();
if (tipoCount.count === 0) {
  const insertTipo = db.prepare('INSERT INTO tipos (nombre, descripcion) VALUES (?, ?)');
  insertTipo.run('Película', 'Producción cinematográfica de larga duración');
  insertTipo.run('Serie', 'Producción de múltiples episodios y temporadas');
}

module.exports = db;
