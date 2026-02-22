import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDataRooms, createDataRoom, renameDataRoom, deleteDataRoom } from '@/store/slices/dataRoomsSlice';
import DataRoomCard from '@/components/dataroom/DataRoomCard';
import CreateDataRoomDialog from '@/components/dataroom/CreateDataRoomDialog';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rooms, status } = useAppSelector((s) => s.dataRooms);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDataRooms());
  }, [dispatch]);

  const handleCreate = async (name: string) => {
    const result = await dispatch(createDataRoom(name));
    if (createDataRoom.fulfilled.match(result)) {
      setCreateOpen(false);
      toast.success(`Data room "${name}" created`);
      navigate(`/dataroom/${result.payload.id}`);
    } else if (createDataRoom.rejected.match(result)) {
      toast.error(result.payload as string);
    }
  };

  const handleRename = async (id: string, name: string) => {
    const result = await dispatch(renameDataRoom({ id, name }));
    if (renameDataRoom.rejected.match(result)) {
      toast.error(result.payload as string);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteDataRoom(id));
    toast.success('Data room deleted');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Data Rooms</h1>
          <p className="text-sm text-muted mt-1">Manage your secure document repositories</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          New Data Room
        </Button>
      </div>

      {status === 'loading' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-white/10" />
                  <div className="h-3 w-24 rounded bg-white/5 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<Database size={48} />}
          title="No data rooms yet"
          description="Create your first data room to start organizing and sharing documents securely."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Data Room
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <DataRoomCard
              key={room.id}
              dataRoom={room}
              onRename={handleRename}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}

      <CreateDataRoomDialog
        open={createOpen}
        onSubmit={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />
    </div>
  );
}
