import { useState } from 'react';
import { createDirector, deleteDirector, getDirectores, updateDirector, type Director } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const AdminDirectores = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombres: '', estado: 'Activo' as 'Activo' | 'Inactivo' });
  const [deleteTarget, setDeleteTarget] = useState<Director | null>(null);
  const [filterId, setFilterId] = useState('');
  const [filterNombres, setFilterNombres] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['directores'],
    queryFn: getDirectores,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Director>) => createDirector(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directores'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Director> }) => updateDirector(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directores'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDirector(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['directores'] });
    },
  });

  const handleSave = () => {
    if (!form.nombres.trim()) { toast({ title: 'Error', description: 'Los nombres son requeridos', variant: 'destructive' }); return; }
    const payload: Partial<Director> = { nombres: form.nombres, estado: form.estado };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Director actualizado' });
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
        toast({ title: 'Director creado' });
        setOpen(false);
        resetForm();
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo crear', variant: 'destructive' });
      },
    });
  };

  const handleEdit = (d: Director) => { setForm({ nombres: d.nombres, estado: d.estado }); setEditingId(d.id); setOpen(true); };
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Director eliminado' });
      },
      onError: (e) => {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'No se pudo eliminar', variant: 'destructive' });
      },
    });
  };
  const resetForm = () => { setForm({ nombres: '', estado: 'Activo' as 'Activo' | 'Inactivo' }); setEditingId(null); };

  const normalized = (value: string) => value.trim().toLowerCase();
  const filteredItems = items.filter((d) => {
    if (filterId.trim() && !String(d.id).includes(filterId.trim())) return false;
    if (filterEstado.trim() && !normalized(d.estado).includes(normalized(filterEstado))) return false;
    if (filterNombres.trim() && !normalized(d.nombres).includes(normalized(filterNombres))) return false;
    return true;
  });

  return (
    <div className="admin-glow rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-card-foreground">Directores</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nuevo Director</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Director</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nombres completos" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as 'Activo' | 'Inactivo' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Inactivo">Inactivo</SelectItem></SelectContent>
              </Select>
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
              <HeaderFilterInput value={filterNombres} onChange={setFilterNombres} placeholder="Nombres" />
            </TableHead>
            <TableHead>
              <HeaderFilterInput value={filterEstado} onChange={setFilterEstado} placeholder="Estado" />
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
                Error cargando directores
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.id}</TableCell>
                <TableCell className="font-medium">{d.nombres}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      d.estado === 'Activo' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {d.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)}>
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
            <AlertDialogTitle>¿Eliminar director?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el director "{deleteTarget?.nombres}" y también todas las producciones asociadas.
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

export default AdminDirectores;
