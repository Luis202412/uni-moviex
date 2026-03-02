const express = require('express');
const cors = require('cors');
const db = require('./database');

const generosRouter = require('./routes/generos');
const directoresRouter = require('./routes/directores');
const productorasRouter = require('./routes/productoras');
const tiposRouter = require('./routes/tipos');
const mediaRouter = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/generos', generosRouter);
app.use('/api/directores', directoresRouter);
app.use('/api/productoras', productorasRouter);
app.use('/api/tipos', tiposRouter);
app.use('/api/media', mediaRouter);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IUDA Movies API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`🎬 IUDA Movies API corriendo en http://localhost:${PORT}`);
});
