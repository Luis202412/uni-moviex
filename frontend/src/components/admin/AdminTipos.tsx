import { useState } from 'react';
import { createTipo, deleteTipo, getTipos, updateTipo, type Tipo } from '@/lib/api';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeaderFilterInput } from '@/components/admin/HeaderFilterInput';

const AdminTipos = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [deleteTarget, setDeleteTarget] = useState<Tipo | null>(null);
  const [filterId, setFilterId] = useState('');
  const [filterNombre, setFilterNombre] = useState('');
  const [filterDescripcion, setFilterDescripcion] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tipos'],
    queryFn: getTipos,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Tipo>) => createTipo(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tipos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tipo> }) => updateTipo(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tipos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTipo(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tipos'] });
    },
  });

  const handleSave = () => {
    if (!form.nombre.trim()) { toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' }); return; }
    const payload: Partial<Tipo> = { nombre: form.nombre, descripcion: form.descripcion || null };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Tipo actualizado' });
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
        toast({ title: 'Tipo creado' });
        setOpen(false);
        resetForm();
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo crear', variant: 'destructive' });
      },
    });
  };

  const handleEdit = (t: Tipo) => { setForm({ nombre: t.nombre, descripcion: t.descripcion || '' }); setEditingId(t.id); setOpen(true); };
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Tipo eliminado' });
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo eliminar', variant: 'destructive' });
      },
    });
  };
  const resetForm = () => { setForm({ nombre: '', descripcion: '' }); setEditingId(null); };

  const normalized = (value: string) => value.trim().toLowerCase();
  const filteredItems = items.filter((t) => {
    if (filterId.trim() && !String(t.id).includes(filterId.trim())) return false;
    if (filterNombre.trim() && !normalized(t.nombre).includes(normalized(filterNombre))) return false;
    if (filterDescripcion.trim() && !normalized(t.descripcion || '').includes(normalized(filterDescripcion))) return false;
    return true;
  });

  return (
    <div className="admin-glow rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-card-foreground">Tipos</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nuevo Tipo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Tipo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
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
              <HeaderFilterInput value={filterDescripcion} onChange={setFilterDescripcion} placeholder="Descripción" />
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                Cargando…
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-destructive">
                Error cargando tipos
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="font-medium">{t.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{t.descripcion}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(t)}>
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
            <AlertDialogTitle>¿Eliminar tipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el tipo "{deleteTarget?.nombre}" y también todas las producciones asociadas.
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

export default AdminTipos;
