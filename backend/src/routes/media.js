const express = require('express');
const router = express.Router();
const db = require('../database');

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function serialFromNumber(n) {
  return `MED-${String(n).padStart(6, '0')}`;
}

const getNextMediaNumber = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 as next FROM media');

// GET - Listar todas las producciones con sus relaciones
router.get('/', (req, res) => {
  try {
    const media = db.prepare(`
      SELECT m.*, 
        g.nombre as genero_nombre,
        d.nombres as director_nombres,
        p.nombre as productora_nombre,
        t.nombre as tipo_nombre
      FROM media m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      ORDER BY m.fecha_creacion DESC
    `).all();
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener producción por ID
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT m.*, 
        g.nombre as genero_nombre,
        d.nombres as director_nombres,
        p.nombre as productora_nombre,
        t.nombre as tipo_nombre
      FROM media m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      WHERE m.id = ?
    `).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Producción no encontrada' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear producción
router.post('/', (req, res) => {
  try {
    const { serial, titulo, sinopsis, url, imagen_portada, anio_estreno, genero_id, director_id, productora_id, tipo_id } = req.body;
    
    const safeTitulo = normalizeOptionalString(titulo);
    const safeUrl = normalizeOptionalString(url);

    if (!safeTitulo || !safeUrl || !genero_id || !director_id || !productora_id || !tipo_id) {
      return res.status(400).json({ error: 'Campos requeridos: titulo, url, genero_id, director_id, productora_id, tipo_id' });
    }

    // Validar que género esté activo
    const genero = db.prepare('SELECT * FROM generos WHERE id = ? AND estado = ?').get(genero_id, 'Activo');
    if (!genero) return res.status(400).json({ error: 'El género seleccionado no existe o no está activo' });

    // Validar que director esté activo
    const director = db.prepare('SELECT * FROM directores WHERE id = ? AND estado = ?').get(director_id, 'Activo');
    if (!director) return res.status(400).json({ error: 'El director seleccionado no existe o no está activo' });

    // Validar que productora esté activa
    const productora = db.prepare('SELECT * FROM productoras WHERE id = ? AND estado = ?').get(productora_id, 'Activo');
    if (!productora) return res.status(400).json({ error: 'La productora seleccionada no existe o no está activa' });

    // Validar tipo
    const tipo = db.prepare('SELECT * FROM tipos WHERE id = ?').get(tipo_id);
    if (!tipo) return res.status(400).json({ error: 'El tipo seleccionado no existe' });

    const insert = db.prepare(
      'INSERT INTO media (serial, titulo, sinopsis, url, imagen_portada, anio_estreno, genero_id, director_id, productora_id, tipo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const run = db.transaction(() => {
      let next = Number(getNextMediaNumber.get()?.next || 1);
      for (let i = 0; i < 25; i += 1) {
        const candidate = serialFromNumber(next + i);
        try {
          return insert.run(
            candidate,
            safeTitulo,
            sinopsis || null,
            safeUrl,
            imagen_portada || null,
            anio_estreno || null,
            genero_id,
            director_id,
            productora_id,
            tipo_id
          );
        } catch (e) {
          const message = String(e?.message || '');
          if (message.includes('UNIQUE') && message.includes('media.serial')) continue;
          throw e;
        }
      }
      throw new Error('No se pudo generar un serial único para la producción');
    });

    const result = run();

    const item = db.prepare(`
      SELECT m.*, 
        g.nombre as genero_nombre,
        d.nombres as director_nombres,
        p.nombre as productora_nombre,
        t.nombre as tipo_nombre
      FROM media m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Ya existe una producción con ese serial o URL' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar producción
router.put('/:id', (req, res) => {
  try {
    const { titulo, sinopsis, url, imagen_portada, anio_estreno, genero_id, director_id, productora_id, tipo_id } = req.body;
    const safeTitulo = normalizeOptionalString(titulo);
    const safeUrl = normalizeOptionalString(url);

    if (genero_id) {
      const genero = db.prepare('SELECT * FROM generos WHERE id = ? AND estado = ?').get(genero_id, 'Activo');
      if (!genero) return res.status(400).json({ error: 'El género seleccionado no existe o no está activo' });
    }
    if (director_id) {
      const director = db.prepare('SELECT * FROM directores WHERE id = ? AND estado = ?').get(director_id, 'Activo');
      if (!director) return res.status(400).json({ error: 'El director seleccionado no existe o no está activo' });
    }
    if (productora_id) {
      const productora = db.prepare('SELECT * FROM productoras WHERE id = ? AND estado = ?').get(productora_id, 'Activo');
      if (!productora) return res.status(400).json({ error: 'La productora seleccionada no existe o no está activa' });
    }
    if (tipo_id) {
      const tipo = db.prepare('SELECT * FROM tipos WHERE id = ?').get(tipo_id);
      if (!tipo) return res.status(400).json({ error: 'El tipo seleccionado no existe' });
    }

    db.prepare(`
      UPDATE media SET 
        titulo = COALESCE(?, titulo),
        sinopsis = COALESCE(?, sinopsis),
        url = COALESCE(?, url),
        imagen_portada = COALESCE(?, imagen_portada),
        anio_estreno = COALESCE(?, anio_estreno),
        genero_id = COALESCE(?, genero_id),
        director_id = COALESCE(?, director_id),
        productora_id = COALESCE(?, productora_id),
        tipo_id = COALESCE(?, tipo_id),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(safeTitulo, sinopsis, safeUrl, imagen_portada, anio_estreno, genero_id, director_id, productora_id, tipo_id, req.params.id);

    const item = db.prepare(`
      SELECT m.*, 
        g.nombre as genero_nombre,
        d.nombres as director_nombres,
        p.nombre as productora_nombre,
        t.nombre as tipo_nombre
      FROM media m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      WHERE m.id = ?
    `).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Producción no encontrada' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar producción
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Producción no encontrada' });
    res.json({ message: 'Producción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
