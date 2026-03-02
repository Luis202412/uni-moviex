import { useState } from 'react';
import { createGenero, deleteGenero, getGeneros, updateGenero, type Genero } from '@/lib/api';
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

const AdminGeneros = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', estado: 'Activo' as 'Activo' | 'Inactivo', descripcion: '' });
  const [deleteTarget, setDeleteTarget] = useState<Genero | null>(null);
  const [filterId, setFilterId] = useState('');
  const [filterNombre, setFilterNombre] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDescripcion, setFilterDescripcion] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: generos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Genero>) => createGenero(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['generos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Genero> }) => updateGenero(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['generos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGenero(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['generos'] });
    },
  });

  const handleSave = () => {
    if (!form.nombre.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
      return;
    }
    const payload: Partial<Genero> = {
      nombre: form.nombre,
      estado: form.estado,
      descripcion: form.descripcion || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Género actualizado' });
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
        toast({ title: 'Género creado' });
        setOpen(false);
        resetForm();
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo crear', variant: 'destructive' });
      },
    });
  };

  const handleEdit = (g: Genero) => {
    setForm({ nombre: g.nombre, estado: g.estado, descripcion: g.descripcion || '' });
    setEditingId(g.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Género eliminado' });
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo eliminar', variant: 'destructive' });
      },
    });
  };

  const resetForm = () => {
    setForm({ nombre: '', estado: 'Activo' as 'Activo' | 'Inactivo', descripcion: '' });
    setEditingId(null);
  };

  const normalized = (value: string) => value.trim().toLowerCase();
  const filteredGeneros = generos.filter((g) => {
    if (filterId.trim() && !String(g.id).includes(filterId.trim())) return false;
    if (filterEstado.trim() && !normalized(g.estado).includes(normalized(filterEstado))) return false;
    if (filterNombre.trim() && !normalized(g.nombre).includes(normalized(filterNombre))) return false;
    if (filterDescripcion.trim() && !normalized(g.descripcion || '').includes(normalized(filterDescripcion))) return false;
    return true;
  });

  return (
    <div className="admin-glow rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-card-foreground">Géneros</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nuevo Género</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Género</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as 'Activo' | 'Inactivo' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              <Button onClick={handleSave} className="w-full">Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <HeaderFilterInput value={filterId} onChange={setFilterId} placeholder="ID" />
            </TableHead>
            <TableHead>
              <HeaderFilterInput value={filterNombre} onChange={setFilterNombre} placeholder="Nombre" />
            </TableHead>
            <TableHead>
              <HeaderFilterInput value={filterEstado} onChange={setFilterEstado} placeholder="Estado" />
            </TableHead>
            <TableHead>
              <HeaderFilterInput value={filterDescripcion} onChange={setFilterDescripcion} placeholder="Descripción" />
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                Cargando…
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-destructive">
                Error cargando géneros
              </TableCell>
            </TableRow>
          ) : (
            filteredGeneros.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-mono text-xs">{g.id}</TableCell>
                <TableCell className="font-medium">{g.nombre}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      g.estado === 'Activo' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {g.estado}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{g.descripcion}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(g)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(g)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog open={deleteTarget != null} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar género?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el género "{deleteTarget?.nombre}" y también todas las producciones asociadas.
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

export default AdminGeneros;
