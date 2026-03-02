import { useState } from 'react';
import {
  createMedia,
  deleteMedia,
  getDirectores,
  getGeneros,
  getMedia,
  getProductoras,
  getTipos,
  updateMedia,
  type Media,
} from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeaderFilterInput } from '@/components/admin/HeaderFilterInput';

const emptyForm = {
  titulo: '', sinopsis: '', url: '', imagen_portada: '',
  anio_estreno: '', genero_id: '', director_id: '', productora_id: '', tipo_id: ''
};

const AdminMedia = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [filterSerial, setFilterSerial] = useState('');
  const [filterTitulo, setFilterTitulo] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterGenero, setFilterGenero] = useState('');
  const [filterDirector, setFilterDirector] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useQuery({
    queryKey: ['media'],
    queryFn: getMedia,
  });

  const { data: generos = [], isLoading: isLoadingGeneros } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const { data: directores = [], isLoading: isLoadingDirectores } = useQuery({
    queryKey: ['directores'],
    queryFn: getDirectores,
  });

  const { data: productoras = [], isLoading: isLoadingProductoras } = useQuery({
    queryKey: ['productoras'],
    queryFn: getProductoras,
  });

  const { data: tipos = [], isLoading: isLoadingTipos } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Media>) => createMedia(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Media> }) => updateMedia(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMedia(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const handleSave = () => {
    if (!form.titulo || !form.url || !form.genero_id || !form.director_id || !form.productora_id || !form.tipo_id) {
      toast({ title: 'Error', description: 'Complete los campos requeridos', variant: 'destructive' });
      return;
    }
    const payload: Partial<Media> = {
      titulo: form.titulo,
      sinopsis: form.sinopsis || null,
      url: form.url,
      imagen_portada: form.imagen_portada || null,
      anio_estreno: form.anio_estreno ? Number(form.anio_estreno) : null,
      genero_id: Number(form.genero_id),
      director_id: Number(form.director_id),
      productora_id: Number(form.productora_id),
      tipo_id: Number(form.tipo_id),
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Producción actualizada' });
            setOpen(false);
            resetForm();
          },
          onError: (e) => {
            toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo actualizar', variant: 'destructive' });
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Producción creada' });
        setOpen(false);
        resetForm();
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo crear', variant: 'destructive' });
      },
    });
  };

  const handleEdit = (m: Media) => {
    setForm({
      titulo: m.titulo, sinopsis: m.sinopsis || '', url: m.url,
      imagen_portada: m.imagen_portada || '', anio_estreno: m.anio_estreno?.toString() || '',
      genero_id: m.genero_id.toString(), director_id: m.director_id.toString(),
      productora_id: m.productora_id.toString(), tipo_id: m.tipo_id.toString(),
    });
    setEditingId(m.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Producción eliminada' });
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo eliminar', variant: 'destructive' });
      },
    });
  };
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const normalized = (value: string) => value.trim().toLowerCase();
  const filteredItems = items.filter((m) => {
    if (filterSerial.trim() && !normalized(m.serial || '').includes(normalized(filterSerial))) return false;
    if (filterTitulo.trim() && !normalized(m.titulo || '').includes(normalized(filterTitulo))) return false;
    if (filterTipo.trim() && !normalized(m.tipo_nombre || '').includes(normalized(filterTipo))) return false;
    if (filterGenero.trim() && !normalized(m.genero_nombre || '').includes(normalized(filterGenero))) return false;
    if (filterDirector.trim() && !normalized(m.director_nombres || '').includes(normalized(filterDirector))) return false;
    if (filterAnio.trim() && !String(m.anio_estreno ?? '').includes(filterAnio.trim())) return false;
    return true;
  });

  return (
    <div className="admin-glow rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-card-foreground">Media (Películas y Series)</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nueva Producción</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nueva'} Producción</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <Textarea placeholder="Sinopsis" value={form.sinopsis} onChange={(e) => setForm({ ...form, sinopsis: e.target.value })} />
              <Input placeholder="URL de la película" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <Input placeholder="URL imagen de portada" value={form.imagen_portada} onChange={(e) => setForm({ ...form, imagen_portada: e.target.value })} />
              <Input type="number" placeholder="Año de estreno" value={form.anio_estreno} onChange={(e) => setForm({ ...form, anio_estreno: e.target.value })} />
              <Select value={form.genero_id} onValueChange={(v) => setForm({ ...form, genero_id: v })}>
                <SelectTrigger><SelectValue placeholder="Género" /></SelectTrigger>
                <SelectContent>
                  {isLoadingGeneros ? (
                    <SelectItem value="__loading_generos" disabled>
                      Cargando…
                    </SelectItem>
                  ) : generos.filter((g) => g.estado === 'Activo').length === 0 ? (
                    <SelectItem value="__empty_generos" disabled>
                      Sin géneros activos
                    </SelectItem>
                  ) : (
                    generos
                      .filter((g) => g.estado === 'Activo')
                      .map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.nombre}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <Select value={form.director_id} onValueChange={(v) => setForm({ ...form, director_id: v })}>
                <SelectTrigger><SelectValue placeholder="Director" /></SelectTrigger>
                <SelectContent>
                  {isLoadingDirectores ? (
                    <SelectItem value="__loading_directores" disabled>
                      Cargando…
                    </SelectItem>
                  ) : directores.filter((d) => d.estado === 'Activo').length === 0 ? (
                    <SelectItem value="__empty_directores" disabled>
                      Sin directores activos
                    </SelectItem>
                  ) : (
                    directores
                      .filter((d) => d.estado === 'Activo')
                      .map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.nombres}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <Select value={form.productora_id} onValueChange={(v) => setForm({ ...form, productora_id: v })}>
                <SelectTrigger><SelectValue placeholder="Productora" /></SelectTrigger>
                <SelectContent>
                  {isLoadingProductoras ? (
                    <SelectItem value="__loading_productoras" disabled>
                      Cargando…
                    </SelectItem>
                  ) : productoras.filter((p) => p.estado === 'Activo').length === 0 ? (
                    <SelectItem value="__empty_productoras" disabled>
                      Sin productoras activas
                    </SelectItem>
                  ) : (
                    productoras
                      .filter((p) => p.estado === 'Activo')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nombre}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <Select value={form.tipo_id} onValueChange={(v) => setForm({ ...form, tipo_id: v })}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  {isLoadingTipos ? (
                    <SelectItem value="__loading_tipos" disabled>
                      Cargando…
                    </SelectItem>
                  ) : tipos.length === 0 ? (
                    <SelectItem value="__empty_tipos" disabled>
                      Sin tipos
                    </SelectItem>
                  ) : (
                    tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleSave} className="w-full">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <HeaderFilterInput value={filterSerial} onChange={setFilterSerial} placeholder="Serial" />
              </TableHead>
              <TableHead>
                <HeaderFilterInput value={filterTitulo} onChange={setFilterTitulo} placeholder="Título" />
              </TableHead>
              <TableHead>
                <HeaderFilterInput value={filterTipo} onChange={setFilterTipo} placeholder="Tipo" />
              </TableHead>
              <TableHead>
                <HeaderFilterInput value={filterGenero} onChange={setFilterGenero} placeholder="Género" />
              </TableHead>
              <TableHead>
                <HeaderFilterInput value={filterDirector} onChange={setFilterDirector} placeholder="Director" />
              </TableHead>
              <TableHead>
                <HeaderFilterInput value={filterAnio} onChange={setFilterAnio} placeholder="Año" />
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMedia ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : mediaError ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-destructive">
                  Error cargando media
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.serial}</TableCell>
                  <TableCell className="font-medium">{m.titulo}</TableCell>
                  <TableCell>
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">{m.tipo_nombre}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.genero_nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{m.director_nombres}</TableCell>
                  <TableCell>{m.anio_estreno}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(m)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteTarget != null} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{deleteTarget?.titulo}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMedia;
