const express = require('express');
const router = express.Router();
const db = require('../database');

// GET - Listar todos los géneros
router.get('/', (_req, res) => {
  try {
    const generos = db.prepare('SELECT * FROM generos ORDER BY nombre').all();
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener género por ID
router.get('/:id', (req, res) => {
  try {
    const genero = db.prepare('SELECT * FROM generos WHERE id = ?').get(req.params.id);
    if (!genero) return res.status(404).json({ error: 'Género no encontrado' });
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear género
router.post('/', (req, res) => {
  try {
    const { nombre, estado, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const result = db.prepare(
      'INSERT INTO generos (nombre, estado, descripcion) VALUES (?, ?, ?)'
    ).run(nombre, estado || 'Activo', descripcion || null);
    const genero = db.prepare('SELECT * FROM generos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(genero);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Ya existe un género con ese nombre' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar género
router.put('/:id', (req, res) => {
  try {
    const { nombre, estado, descripcion } = req.body;
    db.prepare(
      'UPDATE generos SET nombre = COALESCE(?, nombre), estado = COALESCE(?, estado), descripcion = COALESCE(?, descripcion), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(nombre, estado, descripcion, req.params.id);
    const genero = db.prepare('SELECT * FROM generos WHERE id = ?').get(req.params.id);
    if (!genero) return res.status(404).json({ error: 'Género no encontrado' });
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar género
router.delete('/:id', (req, res) => {
  try {
    const deleteMedia = db.prepare('DELETE FROM media WHERE genero_id = ?');
    const deleteGenero = db.prepare('DELETE FROM generos WHERE id = ?');

    const run = db.transaction((id) => {
      const mediaResult = deleteMedia.run(id);
      const generoResult = deleteGenero.run(id);
      return { mediaChanges: mediaResult.changes, generoChanges: generoResult.changes };
    });

    const { mediaChanges, generoChanges } = run(req.params.id);

    if (generoChanges === 0) return res.status(404).json({ error: 'Género no encontrado' });
    res.json({
      message: 'Género eliminado correctamente',
      deleted_media: mediaChanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
