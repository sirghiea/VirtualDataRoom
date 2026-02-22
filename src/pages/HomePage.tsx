import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database, Shield, Lock } from 'lucide-react';
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
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 relative">
      {/* Background orbs */}
      <div className="orb w-96 h-96 -top-48 -left-48 bg-primary/[0.04]" />
      <div className="orb w-64 h-64 -top-20 right-0 bg-blue-500/[0.03]" style={{ animationDelay: '-7s' }} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-12 relative"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight"
            >
              <span className="text-gradient">Data Rooms</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-muted/80 mt-3 max-w-lg leading-relaxed"
            >
              Manage your secure document repositories. Create, organize, and share files with confidence.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              onClick={() => setCreateOpen(true)}
              className="shrink-0"
            >
              <Plus size={16} />
              New Data Room
            </Button>
          </motion.div>
        </div>

        {/* Stats bar */}
        {rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center gap-3 mt-6"
          >
            <div className="stat-chip">
              <Database size={12} className="text-primary" />
              <span>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            </div>
            {rooms.filter((r) => r.passwordHash).length > 0 && (
              <div className="stat-chip">
                <Lock size={10} className="text-amber-400" />
                <span>{rooms.filter((r) => r.passwordHash).length} protected</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Gradient divider */}
      <div className="divider-gradient mb-10" />

      {status === 'loading' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 card-premium inner-glow-purple">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl skeleton" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-36 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-white/[0.04]">
                <div className="h-3 w-20 skeleton ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={
            <div className="relative">
              <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl scale-[2]" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/15 inner-glow-purple">
                <Shield size={40} className="text-primary/70" />
              </div>
            </div>
          }
          title="No data rooms yet"
          description="Create your first data room to start organizing and sharing documents securely."
          action={
            <Button onClick={() => setCreateOpen(true)}>
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
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
