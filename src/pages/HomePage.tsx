import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Data Rooms
            </h1>
            <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
              Manage your secure document repositories. Create, organize, and share files with confidence.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
          >
            <Plus size={16} />
            New Data Room
          </Button>
        </div>

        {/* Stats */}
        {rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-4 mt-5"
          >
            <div className="stat-chip">
              <Database size={12} className="text-primary" />
              <span>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Gradient divider */}
      <div className="divider-gradient mb-8" />

      {status === 'loading' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 card-premium">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl skeleton" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-36 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
                <Shield size={36} className="text-primary/60" />
              </div>
            </div>
          }
          title="No data rooms yet"
          description="Create your first data room to start organizing and sharing documents securely."
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              className="shadow-lg shadow-primary/20"
            >
              <Plus size={16} />
              Create Your First Data Room
            </Button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rooms.map((room, i) => (
            <DataRoomCard
              key={room.id}
              dataRoom={room}
              onRename={handleRename}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </motion.div>
      )}

      <CreateDataRoomDialog
        open={createOpen}
        onSubmit={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />
    </div>
  );
}
