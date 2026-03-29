const API_BASE = 'https://uni-moviex.onrender.com/api';

export interface Genero {
  id: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  fecha_actualizacion: string;
  descripcion: string | null;
}

export interface Director {
  id: number;
  nombres: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Productora {
  id: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  fecha_actualizacion: string;
  slogan: string | null;
  descripcion: string | null;
}

export interface Tipo {
  id: number;
  nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  descripcion: string | null;
}

export interface Media {
  id: number;
  serial: string;
  titulo: string;
  sinopsis: string | null;
  url: string;
  imagen_portada: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  anio_estreno: number | null;
  genero_id: number;
  director_id: number;
  productora_id: number;
  tipo_id: number;
  genero_nombre?: string;
  director_nombres?: string;
  productora_nombre?: string;
  tipo_nombre?: string;
}

// Helpers
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error || 'Error en la solicitud');
  }
  return res.json();
}

// Géneros
export const getGeneros = () => request<Genero[]>('/generos');
export const createGenero = (data: Partial<Genero>) => request<Genero>('/generos', { method: 'POST', body: JSON.stringify(data) });
export const updateGenero = (id: number, data: Partial<Genero>) => request<Genero>(`/generos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGenero = (id: number) => request(`/generos/${id}`, { method: 'DELETE' });

// Directores
export const getDirectores = () => request<Director[]>('/directores');
export const createDirector = (data: Partial<Director>) => request<Director>('/directores', { method: 'POST', body: JSON.stringify(data) });
export const updateDirector = (id: number, data: Partial<Director>) => request<Director>(`/directores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDirector = (id: number) => request(`/directores/${id}`, { method: 'DELETE' });

// Productoras
export const getProductoras = () => request<Productora[]>('/productoras');
export const createProductora = (data: Partial<Productora>) => request<Productora>('/productoras', { method: 'POST', body: JSON.stringify(data) });
export const updateProductora = (id: number, data: Partial<Productora>) => request<Productora>(`/productoras/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProductora = (id: number) => request(`/productoras/${id}`, { method: 'DELETE' });

// Tipos
export const getTipos = () => request<Tipo[]>('/tipos');
export const createTipo = (data: Partial<Tipo>) => request<Tipo>('/tipos', { method: 'POST', body: JSON.stringify(data) });
export const updateTipo = (id: number, data: Partial<Tipo>) => request<Tipo>(`/tipos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTipo = (id: number) => request(`/tipos/${id}`, { method: 'DELETE' });

// Media
export const getMedia = () => request<Media[]>('/media');
export const getMediaById = (id: number) => request<Media>(`/media/${id}`);
export const createMedia = (data: Partial<Media>) => request<Media>('/media', { method: 'POST', body: JSON.stringify(data) });
export const updateMedia = (id: number, data: Partial<Media>) => request<Media>(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMedia = (id: number) => request(`/media/${id}`, { method: 'DELETE' });
