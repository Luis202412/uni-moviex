import { useState } from 'react';
import { createProductora, deleteProductora, getProductoras, updateProductora, type Productora } from '@/lib/api';
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

const AdminProductoras = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', estado: 'Activo' as 'Activo' | 'Inactivo', slogan: '', descripcion: '' });
  const [deleteTarget, setDeleteTarget] = useState<Productora | null>(null);
  const [filterId, setFilterId] = useState('');
  const [filterNombre, setFilterNombre] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterSlogan, setFilterSlogan] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['productoras'],
    queryFn: getProductoras,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Productora>) => createProductora(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productoras'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Productora> }) => updateProductora(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productoras'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductora(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productoras'] });
    },
  });

  const handleSave = () => {
    if (!form.nombre.trim()) { toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' }); return; }
    const payload: Partial<Productora> = {
      nombre: form.nombre,
      estado: form.estado,
      slogan: form.slogan || null,
      descripcion: form.descripcion || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Productora actualizada' });
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
        toast({ title: 'Productora creada' });
        setOpen(false);
        resetForm();
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo crear', variant: 'destructive' });
      },
    });
  };

  const handleEdit = (p: Productora) => { setForm({ nombre: p.nombre, estado: p.estado, slogan: p.slogan || '', descripcion: p.descripcion || '' }); setEditingId(p.id); setOpen(true); };
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Productora eliminada' });
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo eliminar', variant: 'destructive' });
      },
    });
  };
  const resetForm = () => { setForm({ nombre: '', estado: 'Activo' as 'Activo' | 'Inactivo', slogan: '', descripcion: '' }); setEditingId(null); };

  const normalized = (value: string) => value.trim().toLowerCase();
  const filteredItems = items.filter((p) => {
    if (filterId.trim() && !String(p.id).includes(filterId.trim())) return false;
    if (filterEstado.trim() && !normalized(p.estado).includes(normalized(filterEstado))) return false;
    if (filterNombre.trim() && !normalized(p.nombre).includes(normalized(filterNombre))) return false;
    if (filterSlogan.trim() && !normalized(p.slogan || '').includes(normalized(filterSlogan))) return false;
    return true;
  });

  return (
    <div className="admin-glow rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-card-foreground">Productoras</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nueva Productora</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nueva'} Productora</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as 'Activo' | 'Inactivo' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Inactivo">Inactivo</SelectItem></SelectContent>
              </Select>
              <Input placeholder="Slogan" value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} />
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
              <HeaderFilterInput value={filterSlogan} onChange={setFilterSlogan} placeholder="Slogan" />
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
                Error cargando productoras
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.estado === 'Activo' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {p.estado}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.slogan}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)}>
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
            <AlertDialogTitle>¿Eliminar productora?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la productora "{deleteTarget?.nombre}" y también todas las producciones asociadas.
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

export default AdminProductoras;
