import { useState } from 'react';
import heroBanner from '@/assets/hero-banner.jpg';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getGeneros, getMedia } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Film, Search } from 'lucide-react';

const Index = () => {
  const [selectedGenero, setSelectedGenero] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
    data: generos = [],
    isLoading: isLoadingGeneros,
    error: generosError,
  } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const {
    data: media = [],
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useQuery({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const years = Array.from(new Set(media.map((m) => m.anio_estreno).filter((y): y is number => typeof y === 'number'))).sort(
    (a, b) => b - a
  );
  const filteredMedia = media.filter((m) => {
    if (selectedGenero && m.genero_id !== selectedGenero) return false;
    if (selectedYear != null && m.anio_estreno !== selectedYear) return false;
    if (!normalizedSearch) return true;
    const title = (m.titulo || '').toLowerCase();
    const synopsis = (m.sinopsis || '').toLowerCase();
    return title.includes(normalizedSearch) || synopsis.includes(normalizedSearch);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[65vh] overflow-hidden">
        <img src={heroBanner} alt="Uni Movies X" className="h-full w-full object-cover" />
        <div className="cinema-overlay absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Film className="mb-4 h-16 w-16 text-primary animate-fade-in" />
          <h1 className="font-display text-6xl tracking-wider text-foreground animate-fade-in md:text-8xl">
            Uni <span className="text-gradient-cinema">Movies X</span>
          </h1>
          <p className="mt-7 max-w-xl text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Una Plataforma de entretenimiento fresca y única de la Institución Universitaria Digital de Antioquia.
            Películas y series de forma gratuita para toda nuestra comunidad.
          </p>
        </div>
      </section>

      {/* Filtro por género */}
      <section className="container mx-auto px-4 pb-8 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedGenero(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!selectedGenero
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
              }`}
          >
            Todos
          </button>
          {isLoadingGeneros ? (
            <span className="text-sm text-muted-foreground">Cargando géneros…</span>
          ) : generosError ? (
            <span className="text-sm text-destructive">Error cargando géneros</span>
          ) : (
            generos.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenero(g.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedGenero === g.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                  }`}
              >
                {g.nombre}
              </button>
            ))
          )}
        </div>
      </section>

      {/* Grid de películas */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl text-foreground">
            {selectedGenero
              ? generos.find((g) => g.id === selectedGenero)?.nombre
              : 'Catálogo Completo'}
          </h2>
          <div className="flex w-full gap-2 sm:w-[460px]">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título o sinopsis…"
                className="pl-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="shrink-0 gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedYear ?? ''}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[220px] p-2">
                <div className="flex flex-col">
                  <Button
                    variant={selectedYear == null ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedYear(null)}
                  >
                    Todos
                  </Button>
                  <div className="max-h-[260px] overflow-y-auto">
                    {years.map((y) => (
                      <Button
                        key={y}
                        variant={selectedYear === y ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedYear(y)}
                      >
                        {y}
                      </Button>
                    ))}
                    {years.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Sin años disponibles</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {isLoadingMedia ? (
          <p className="py-20 text-center text-muted-foreground">Cargando catálogo…</p>
        ) : mediaError ? (
          <p className="py-20 text-center text-destructive">Error cargando el catálogo.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMedia.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {filteredMedia.length === 0 && (
              <p className="py-20 text-center text-muted-foreground">
                {normalizedSearch
                  ? 'No hay resultados para tu búsqueda.'
                  : selectedYear != null
                    ? 'No hay producciones para ese año.'
                    : 'No hay producciones en este género.'}
              </p>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 Institución Universitaria Digital de Antioquia — Uni Movies X</p>
      </footer>
    </div>
  );
};

export default Index;
