const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const tipos = db.prepare('SELECT * FROM tipos ORDER BY nombre').all();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const tipo = db.prepare('SELECT * FROM tipos WHERE id = ?').get(req.params.id);
    if (!tipo) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const result = db.prepare(
      'INSERT INTO tipos (nombre, descripcion) VALUES (?, ?)'
    ).run(nombre, descripcion || null);
    const tipo = db.prepare('SELECT * FROM tipos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tipo);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Ya existe un tipo con ese nombre' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    db.prepare(
      'UPDATE tipos SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(nombre, descripcion, req.params.id);
    const tipo = db.prepare('SELECT * FROM tipos WHERE id = ?').get(req.params.id);
    if (!tipo) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleteMedia = db.prepare('DELETE FROM media WHERE tipo_id = ?');
    const deleteTipo = db.prepare('DELETE FROM tipos WHERE id = ?');

    const run = db.transaction((id) => {
      const mediaResult = deleteMedia.run(id);
      const tipoResult = deleteTipo.run(id);
      return { mediaChanges: mediaResult.changes, tipoChanges: tipoResult.changes };
    });

    const { mediaChanges, tipoChanges } = run(req.params.id);

    if (tipoChanges === 0) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json({
      message: 'Tipo eliminado correctamente',
      deleted_media: mediaChanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
