const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const directores = db.prepare('SELECT * FROM directores ORDER BY nombres').all();
    res.json(directores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const director = db.prepare('SELECT * FROM directores WHERE id = ?').get(req.params.id);
    if (!director) return res.status(404).json({ error: 'Director no encontrado' });
    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { nombres, estado } = req.body;
    if (!nombres) return res.status(400).json({ error: 'Los nombres son requeridos' });
    const result = db.prepare(
      'INSERT INTO directores (nombres, estado) VALUES (?, ?)'
    ).run(nombres, estado || 'Activo');
    const director = db.prepare('SELECT * FROM directores WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { nombres, estado } = req.body;
    db.prepare(
      'UPDATE directores SET nombres = COALESCE(?, nombres), estado = COALESCE(?, estado), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(nombres, estado, req.params.id);
    const director = db.prepare('SELECT * FROM directores WHERE id = ?').get(req.params.id);
    if (!director) return res.status(404).json({ error: 'Director no encontrado' });
    res.json(director);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleteMedia = db.prepare('DELETE FROM media WHERE director_id = ?');
    const deleteDirector = db.prepare('DELETE FROM directores WHERE id = ?');

    const run = db.transaction((id) => {
      const mediaResult = deleteMedia.run(id);
      const directorResult = deleteDirector.run(id);
      return { mediaChanges: mediaResult.changes, directorChanges: directorResult.changes };
    });

    const { mediaChanges, directorChanges } = run(req.params.id);

    if (directorChanges === 0) return res.status(404).json({ error: 'Director no encontrado' });
    res.json({
      message: 'Director eliminado correctamente',
      deleted_media: mediaChanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
