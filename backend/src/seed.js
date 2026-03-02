const fs = require('fs');
const vm = require('vm');
const db = require('./database');

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function pad3(n) {
  return String(n).padStart(3, '0');
}

function buildEmbeddedData() {
  const baseDate = '2025-01-01';

  const generos = [
    { id: 1, nombre: 'Acción', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Películas de acción' },
    { id: 2, nombre: 'Aventura', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Películas de aventura' },
    { id: 3, nombre: 'Ciencia Ficción', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Ciencia ficción' },
    { id: 4, nombre: 'Drama', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Drama' },
    { id: 5, nombre: 'Terror', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Terror' },
    { id: 6, nombre: 'Comedia', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Comedia' },
    { id: 7, nombre: 'Romance', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Romance' },
    { id: 8, nombre: 'Animación', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Animación' },
    { id: 9, nombre: 'Suspenso', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Suspenso' },
    { id: 10, nombre: 'Fantasía', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Fantasía' },
    { id: 11, nombre: 'Documental', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Documental' },
    { id: 12, nombre: 'Crimen', estado: 'Activo', fecha_creacion: baseDate, fecha_actualizacion: baseDate, descripcion: 'Crimen' },
  ];

  const directores = [
    { id: 1, nombres: 'Christopher Nolan' },
    { id: 2, nombres: 'Denis Villeneuve' },
    { id: 3, nombres: 'Stanley Kubrick' },
    { id: 4, nombres: 'Hermanos Duffer' },
    { id: 5, nombres: 'Patty Jenkins' },
    { id: 6, nombres: 'Guillermo del Toro' },
    { id: 7, nombres: 'Greta Gerwig' },
    { id: 8, nombres: 'Bong Joon-ho' },
    { id: 9, nombres: 'Jordan Peele' },
    { id: 10, nombres: 'Alfonso Cuarón' },
    { id: 11, nombres: 'Martin Scorsese' },
    { id: 12, nombres: 'Hayao Miyazaki' },
  ];

  const productoras = [
    { id: 1, nombre: 'Paramount Pictures' },
    { id: 2, nombre: 'Warner Bros' },
    { id: 3, nombre: 'Netflix' },
    { id: 4, nombre: 'Universal Pictures' },
    { id: 5, nombre: 'A24' },
    { id: 6, nombre: 'Pixar' },
    { id: 7, nombre: 'Studio Ghibli' },
    { id: 8, nombre: 'HBO' },
  ];

  const tipos = [
    { id: 1, nombre: 'Película' },
    { id: 2, nombre: 'Serie' },
  ];

  const baseMedia = [
    {
      id: 1,
      serial: 'MOV-001',
      titulo: 'Interestelar',
      sinopsis:
        'Un grupo de exploradores espaciales viajan a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.',
      url: 'https://example.com/interstellar',
      imagen_portada: 'https://picsum.photos/seed/MOV-001/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 2014,
      genero_id: 3,
      director_id: 1,
      productora_id: 1,
      tipo_id: 1,
      genero_nombre: 'Ciencia Ficción',
      director_nombres: 'Christopher Nolan',
      productora_nombre: 'Paramount Pictures',
      tipo_nombre: 'Película',
    },
    {
      id: 2,
      serial: 'MOV-002',
      titulo: 'El Caballero Oscuro',
      sinopsis: 'Batman enfrenta al Joker, un criminal psicópata que busca sumir a Gotham City en la anarquía.',
      url: 'https://example.com/dark-knight',
      imagen_portada: 'https://picsum.photos/seed/MOV-002/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 2008,
      genero_id: 1,
      director_id: 1,
      productora_id: 2,
      tipo_id: 1,
      genero_nombre: 'Acción',
      director_nombres: 'Christopher Nolan',
      productora_nombre: 'Warner Bros',
      tipo_nombre: 'Película',
    },
    {
      id: 3,
      serial: 'MOV-003',
      titulo: 'Blade Runner 2049',
      sinopsis: 'Un nuevo blade runner descubre un secreto enterrado que podría sumergir a la sociedad en el caos.',
      url: 'https://example.com/blade-runner',
      imagen_portada: 'https://picsum.photos/seed/MOV-003/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 2017,
      genero_id: 3,
      director_id: 2,
      productora_id: 2,
      tipo_id: 1,
      genero_nombre: 'Ciencia Ficción',
      director_nombres: 'Denis Villeneuve',
      productora_nombre: 'Warner Bros',
      tipo_nombre: 'Película',
    },
    {
      id: 4,
      serial: 'MOV-004',
      titulo: 'El Resplandor',
      sinopsis: 'Un escritor y su familia se mudan a un hotel aislado donde una presencia siniestra los acecha.',
      url: 'https://example.com/shining',
      imagen_portada: 'https://picsum.photos/seed/MOV-004/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 1980,
      genero_id: 5,
      director_id: 3,
      productora_id: 2,
      tipo_id: 1,
      genero_nombre: 'Terror',
      director_nombres: 'Stanley Kubrick',
      productora_nombre: 'Warner Bros',
      tipo_nombre: 'Película',
    },
    {
      id: 5,
      serial: 'SER-001',
      titulo: 'Stranger Things',
      sinopsis: 'Cuando un niño desaparece, sus amigos, su familia y la policía se ven envueltos en un misterio sobrenatural.',
      url: 'https://example.com/stranger-things',
      imagen_portada: 'https://picsum.photos/seed/SER-001/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 2016,
      genero_id: 3,
      director_id: 4,
      productora_id: 3,
      tipo_id: 2,
      genero_nombre: 'Ciencia Ficción',
      director_nombres: 'Hermanos Duffer',
      productora_nombre: 'Netflix',
      tipo_nombre: 'Serie',
    },
    {
      id: 6,
      serial: 'MOV-005',
      titulo: 'Dune',
      sinopsis:
        'Paul Atreides, un joven brillante destinado a un destino extraordinario, viaja al planeta más peligroso del universo.',
      url: 'https://example.com/dune',
      imagen_portada: 'https://picsum.photos/seed/MOV-005/400/600',
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: 2021,
      genero_id: 3,
      director_id: 2,
      productora_id: 2,
      tipo_id: 1,
      genero_nombre: 'Ciencia Ficción',
      director_nombres: 'Denis Villeneuve',
      productora_nombre: 'Warner Bros',
      tipo_nombre: 'Película',
    },
  ];

  const rand = mulberry32(20250226);
  const titleA = ['Sombras', 'Luz', 'Destino', 'Horizonte', 'Código', 'Legado', 'Ecos', 'Frontera', 'Ciudad', 'Planeta', 'Noche', 'Alba'];
  const titleB = ['de Acero', 'Perdida', 'Final', 'Infinita', 'Oculta', 'de Cristal', 'Silenciosa', 'de Medianoche', 'de Ceniza', 'Secreta', 'del Norte', 'del Sur'];
  const totalMedia = 80;

  let nextId = baseMedia.length + 1;
  let nextMov = 6;
  let nextSer = 1;

  const usedSerial = new Set(baseMedia.map((m) => m.serial));
  const usedUrl = new Set(baseMedia.map((m) => m.url));

  const generated = [];
  while (baseMedia.length + generated.length < totalMedia) {
    const tipo = pick(tipos, rand);
    const genero = pick(generos, rand);
    const director = pick(directores, rand);
    const productora = pick(productoras, rand);

    const title = `${pick(titleA, rand)} ${pick(titleB, rand)}`;
    const anio = 1980 + Math.floor(rand() * 46);

    let serial;
    if (tipo.id === 2) {
      nextSer += 1;
      serial = `SER-${pad3(nextSer)}`;
    } else {
      nextMov += 1;
      serial = `MOV-${pad3(nextMov)}`;
    }

    if (usedSerial.has(serial)) continue;

    const url = `https://example.com/media/${serial.toLowerCase()}`;
    if (usedUrl.has(url)) continue;

    usedSerial.add(serial);
    usedUrl.add(url);

    generated.push({
      id: nextId,
      serial,
      titulo: title,
      sinopsis: `En ${genero.nombre}, ${title.toLowerCase()} pone a prueba lealtades, secretos y decisiones imposibles.`,
      url,
      imagen_portada: `https://picsum.photos/seed/${encodeURIComponent(serial)}/400/600`,
      fecha_creacion: baseDate,
      fecha_actualizacion: baseDate,
      anio_estreno: anio,
      genero_id: genero.id,
      director_id: director.id,
      productora_id: productora.id,
      tipo_id: tipo.id,
      genero_nombre: genero.nombre,
      director_nombres: director.nombres,
      productora_nombre: productora.nombre,
      tipo_nombre: tipo.nombre,
    });

    nextId += 1;
  }

  return { MOCK_GENEROS: generos, MOCK_MEDIA: [...baseMedia, ...generated] };
}

const EMBEDDED_DATA = buildEmbeddedData();

function parseArgs(argv) {
  const args = { dryRun: false, mockPath: null };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (a === '--mock') {
      args.mockPath = argv[i + 1] || null;
      i += 1;
      continue;
    }
  }
  return args;
}

function loadFrontendMockData(mockFilePath) {
  const raw = fs.readFileSync(mockFilePath, 'utf8');

  const transformed = raw
    .split(/\r?\n/g)
    .filter((line) => !/^\s*import\s+type\s+/.test(line))
    .filter((line) => !/^\s*import\s+/.test(line))
    .join('\n')
    .replace(/\bexport\s+const\s+/g, 'const ')
    .replace(/const\s+([A-Za-z0-9_$]+)\s*:\s*[^=]+=/g, 'const $1 =')
    .replace(/\bexport\s+\{[^}]*\}\s*;?/g, '');

  const sandbox = {};
  vm.runInNewContext(
    `${transformed}\nthis.__result = { MOCK_GENEROS, MOCK_MEDIA };`,
    sandbox,
    { filename: mockFilePath }
  );

  if (!sandbox.__result || !Array.isArray(sandbox.__result.MOCK_GENEROS) || !Array.isArray(sandbox.__result.MOCK_MEDIA)) {
    throw new Error('No se pudieron cargar MOCK_GENEROS y MOCK_MEDIA desde mockData.ts');
  }

  return sandbox.__result;
}

function uniqueById(items) {
  const byId = new Map();
  for (const item of items) {
    if (item && item.id != null && !byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id));
}

function buildDerivedTablesFromMedia(media) {
  const directores = uniqueById(
    media.map((m) => ({
      id: m.director_id,
      nombres: m.director_nombres || `Director ${m.director_id}`,
      estado: 'Activo',
      fecha_creacion: m.fecha_creacion || '2025-01-01',
      fecha_actualizacion: m.fecha_actualizacion || '2025-01-01',
    }))
  );

  const productoras = uniqueById(
    media.map((m) => ({
      id: m.productora_id,
      nombre: m.productora_nombre || `Productora ${m.productora_id}`,
      estado: 'Activo',
      fecha_creacion: m.fecha_creacion || '2025-01-01',
      fecha_actualizacion: m.fecha_actualizacion || '2025-01-01',
      slogan: null,
      descripcion: null,
    }))
  );

  const tipos = uniqueById(
    media.map((m) => ({
      id: m.tipo_id,
      nombre: m.tipo_nombre || `Tipo ${m.tipo_id}`,
      fecha_creacion: m.fecha_creacion || '2025-01-01',
      fecha_actualizacion: m.fecha_actualizacion || '2025-01-01',
      descripcion: null,
    }))
  );

  return { directores, productoras, tipos };
}

function resetTables() {
  db.exec(`
    DELETE FROM media;
    DELETE FROM directores;
    DELETE FROM productoras;
    DELETE FROM tipos;
    DELETE FROM generos;
  `);

  try {
    db.exec(`
      DELETE FROM sqlite_sequence WHERE name IN ('media', 'directores', 'productoras', 'tipos', 'generos');
    `);
  } catch (e) {
    void e;
  }
}

function seed({ generos, directores, productoras, tipos, media }) {
  const insertGenero = db.prepare(
    'INSERT INTO generos (id, nombre, estado, fecha_creacion, fecha_actualizacion, descripcion) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertDirector = db.prepare(
    'INSERT INTO directores (id, nombres, estado, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?)'
  );
  const insertProductora = db.prepare(
    'INSERT INTO productoras (id, nombre, estado, fecha_creacion, fecha_actualizacion, slogan, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertTipo = db.prepare(
    'INSERT INTO tipos (id, nombre, fecha_creacion, fecha_actualizacion, descripcion) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMedia = db.prepare(
    'INSERT INTO media (id, serial, titulo, sinopsis, url, imagen_portada, fecha_creacion, fecha_actualizacion, anio_estreno, genero_id, director_id, productora_id, tipo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const g of generos) {
    insertGenero.run(g.id, g.nombre, g.estado || 'Activo', g.fecha_creacion || null, g.fecha_actualizacion || null, g.descripcion || null);
  }
  for (const d of directores) {
    insertDirector.run(d.id, d.nombres, d.estado || 'Activo', d.fecha_creacion || null, d.fecha_actualizacion || null);
  }
  for (const p of productoras) {
    insertProductora.run(
      p.id,
      p.nombre,
      p.estado || 'Activo',
      p.fecha_creacion || null,
      p.fecha_actualizacion || null,
      p.slogan || null,
      p.descripcion || null
    );
  }
  for (const t of tipos) {
    insertTipo.run(t.id, t.nombre, t.fecha_creacion || null, t.fecha_actualizacion || null, t.descripcion || null);
  }
  for (const m of media) {
    insertMedia.run(
      m.id,
      m.serial,
      m.titulo,
      m.sinopsis || null,
      m.url,
      m.imagen_portada || null,
      m.fecha_creacion || null,
      m.fecha_actualizacion || null,
      m.anio_estreno || null,
      m.genero_id,
      m.director_id,
      m.productora_id,
      m.tipo_id
    );
  }
}

function getCounts() {
  const names = ['generos', 'directores', 'productoras', 'tipos', 'media'];
  const out = {};
  for (const n of names) out[n] = db.prepare(`SELECT COUNT(*) as c FROM ${n}`).get().c;
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  let dataSource = 'embedded';
  let mockPath = null;
  let data = EMBEDDED_DATA;
  if (args.mockPath) {
    dataSource = 'mockPath';
    mockPath = args.mockPath;
    data = loadFrontendMockData(args.mockPath);
  }

  const { MOCK_GENEROS, MOCK_MEDIA } = data;
  const { directores, productoras, tipos } = buildDerivedTablesFromMedia(MOCK_MEDIA);

  const tx = db.transaction(() => {
    resetTables();
    seed({
      generos: MOCK_GENEROS,
      directores,
      productoras,
      tipos,
      media: MOCK_MEDIA,
    });
  });

  const before = getCounts();

  if (args.dryRun) {
    console.log('DRY RUN');
    console.log({
      dataSource,
      mockPath,
      wouldWrite: {
        generos: MOCK_GENEROS.length,
        directores: directores.length,
        productoras: productoras.length,
        tipos: tipos.length,
        media: MOCK_MEDIA.length,
      },
      dbCountsBefore: before,
    });
    return;
  }

  tx();

  const after = getCounts();
  console.log({ dataSource, mockPath, dbCountsAfter: after });
}

main();
