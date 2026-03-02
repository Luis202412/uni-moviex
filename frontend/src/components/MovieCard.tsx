import type { Media } from '@/lib/api';
import { Play, Calendar, User, Building2 } from 'lucide-react';

interface MovieCardProps {
  movie: Media;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const content = (
    <div className="cinema-card-hover group relative overflow-hidden rounded-lg bg-card">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.imagen_portada || '/placeholder.svg'}
          alt={movie.titulo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="cinema-overlay absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {movie.tipo_nombre}
              </span>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {movie.genero_nombre}
              </span>
            </div>
            <p className="line-clamp-3 text-xs text-muted-foreground">{movie.sinopsis}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {movie.anio_estreno && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {movie.anio_estreno}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {movie.director_nombres}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <Play className="h-6 w-6" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="truncate font-display text-lg text-card-foreground transition-opacity duration-200 group-hover:opacity-0">
          {movie.titulo}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground transition-opacity duration-200 group-hover:opacity-0">
          <Building2 className="h-3 w-3" />
          {movie.productora_nombre}
        </div>
      </div>
    </div>
  );

  if (!movie.url) return content;

  return (
    <a href={movie.url} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
};

export default MovieCard;
