const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  try {
    const productoras = db.prepare('SELECT * FROM productoras ORDER BY nombre').all();
    res.json(productoras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const productora = db.prepare('SELECT * FROM productoras WHERE id = ?').get(req.params.id);
    if (!productora) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json(productora);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { nombre, estado, slogan, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const result = db.prepare(
      'INSERT INTO productoras (nombre, estado, slogan, descripcion) VALUES (?, ?, ?, ?)'
    ).run(nombre, estado || 'Activo', slogan || null, descripcion || null);
    const productora = db.prepare('SELECT * FROM productoras WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(productora);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Ya existe una productora con ese nombre' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { nombre, estado, slogan, descripcion } = req.body;
    db.prepare(
      'UPDATE productoras SET nombre = COALESCE(?, nombre), estado = COALESCE(?, estado), slogan = COALESCE(?, slogan), descripcion = COALESCE(?, descripcion), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(nombre, estado, slogan, descripcion, req.params.id);
    const productora = db.prepare('SELECT * FROM productoras WHERE id = ?').get(req.params.id);
    if (!productora) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json(productora);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleteMedia = db.prepare('DELETE FROM media WHERE productora_id = ?');
    const deleteProductora = db.prepare('DELETE FROM productoras WHERE id = ?');

    const run = db.transaction((id) => {
      const mediaResult = deleteMedia.run(id);
      const productoraResult = deleteProductora.run(id);
      return { mediaChanges: mediaResult.changes, productoraChanges: productoraResult.changes };
    });

    const { mediaChanges, productoraChanges } = run(req.params.id);

    if (productoraChanges === 0) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json({
      message: 'Productora eliminada correctamente',
      deleted_media: mediaChanges,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
