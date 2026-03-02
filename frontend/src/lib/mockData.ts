import type { Media, Genero } from '@/lib/api';

// Datos de demostración para cuando el backend no está conectado
export const MOCK_GENEROS: Genero[] = [
  { id: 1, nombre: 'Acción', estado: 'Activo', fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', descripcion: 'Películas de acción' },
  { id: 2, nombre: 'Aventura', estado: 'Activo', fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', descripcion: 'Películas de aventura' },
  { id: 3, nombre: 'Ciencia Ficción', estado: 'Activo', fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', descripcion: 'Ciencia ficción' },
  { id: 4, nombre: 'Drama', estado: 'Activo', fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', descripcion: 'Drama' },
  { id: 5, nombre: 'Terror', estado: 'Activo', fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', descripcion: 'Terror' },
];

export const MOCK_MEDIA: Media[] = [
  {
    id: 1, serial: 'MOV-001', titulo: 'Interestelar', sinopsis: 'Un grupo de exploradores espaciales viajan a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.',
    url: 'https://example.com/interstellar', imagen_portada: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 2014,
    genero_id: 3, director_id: 1, productora_id: 1, tipo_id: 1,
    genero_nombre: 'Ciencia Ficción', director_nombres: 'Christopher Nolan', productora_nombre: 'Paramount Pictures', tipo_nombre: 'Película'
  },
  {
    id: 2, serial: 'MOV-002', titulo: 'El Caballero Oscuro', sinopsis: 'Batman enfrenta al Joker, un criminal psicópata que busca sumir a Gotham City en la anarquía.',
    url: 'https://example.com/dark-knight', imagen_portada: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 2008,
    genero_id: 1, director_id: 1, productora_id: 2, tipo_id: 1,
    genero_nombre: 'Acción', director_nombres: 'Christopher Nolan', productora_nombre: 'Warner Bros', tipo_nombre: 'Película'
  },
  {
    id: 3, serial: 'MOV-003', titulo: 'Blade Runner 2049', sinopsis: 'Un nuevo blade runner descubre un secreto enterrado que podría sumergir a la sociedad en el caos.',
    url: 'https://example.com/blade-runner', imagen_portada: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 2017,
    genero_id: 3, director_id: 2, productora_id: 2, tipo_id: 1,
    genero_nombre: 'Ciencia Ficción', director_nombres: 'Denis Villeneuve', productora_nombre: 'Warner Bros', tipo_nombre: 'Película'
  },
  {
    id: 4, serial: 'MOV-004', titulo: 'El Resplandor', sinopsis: 'Un escritor y su familia se mudan a un hotel aislado donde una presencia siniestra los acecha.',
    url: 'https://example.com/shining', imagen_portada: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 1980,
    genero_id: 5, director_id: 3, productora_id: 2, tipo_id: 1,
    genero_nombre: 'Terror', director_nombres: 'Stanley Kubrick', productora_nombre: 'Warner Bros', tipo_nombre: 'Película'
  },
  {
    id: 5, serial: 'SER-001', titulo: 'Stranger Things', sinopsis: 'Cuando un niño desaparece, sus amigos, su familia y la policía se ven envueltos en un misterio sobrenatural.',
    url: 'https://example.com/stranger-things', imagen_portada: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 2016,
    genero_id: 3, director_id: 4, productora_id: 3, tipo_id: 2,
    genero_nombre: 'Ciencia Ficción', director_nombres: 'Hermanos Duffer', productora_nombre: 'Netflix', tipo_nombre: 'Serie'
  },
  {
    id: 6, serial: 'MOV-005', titulo: 'Dune', sinopsis: 'Paul Atreides, un joven brillante destinado a un destino extraordinario, viaja al planeta más peligroso del universo.',
    url: 'https://example.com/dune', imagen_portada: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=400&h=600&fit=crop',
    fecha_creacion: '2025-01-01', fecha_actualizacion: '2025-01-01', anio_estreno: 2021,
    genero_id: 3, director_id: 2, productora_id: 2, tipo_id: 1,
    genero_nombre: 'Ciencia Ficción', director_nombres: 'Denis Villeneuve', productora_nombre: 'Warner Bros', tipo_nombre: 'Película'
  },
];
