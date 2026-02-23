import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Shield, Lock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDataRooms,
  fetchRoomStats,
  createDataRoom,
  renameDataRoom,
  deleteDataRoom,
} from '@/store/slices/dataRoomsSlice';
import { setHomeSearchQuery } from '@/store/slices/uiSlice';
import DataRoomCard from '@/components/dataroom/DataRoomCard';
import CreateDataRoomDialog from '@/components/dataroom/CreateDataRoomDialog';
import HomeToolbar from '@/components/dataroom/HomeToolbar';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useFilteredRooms } from '@/hooks/useFilteredRooms';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rooms, status, roomStats } = useAppSelector((s) => s.dataRooms);
  const { homeSearchQuery, homeFilter } = useAppSelector((s) => s.ui);
  const [createOpen, setCreateOpen] = useState(false);
  const filteredRooms = useFilteredRooms();

  useEffect(() => {
    dispatch(fetchDataRooms()).then((result) => {
      if (fetchDataRooms.fulfilled.match(result)) {
        dispatch(fetchRoomStats(result.payload));
      }
    });
  }, [dispatch]);

  const protectedCount = rooms.filter((r) => r.passwordHash).length;
  const totalFiles = Object.values(roomStats).reduce(
    (sum, s) => sum + s.files,
    0
  );

  const isFiltering = homeSearchQuery.trim() || homeFilter !== 'all';

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
      <div
        className="orb w-64 h-64 -top-20 right-0 bg-blue-500/[0.03]"
        style={{ animationDelay: '-7s' }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10 relative"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60 mb-3"
        >
          Dashboard
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl font-bold tracking-tight"
        >
          <span className="text-gradient">Data Rooms</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-muted/80 mt-4 max-w-lg leading-relaxed"
        >
          Manage your secure document repositories. Create, organize, and share
          files with confidence.
        </motion.p>

        {/* Stat cards */}
        {rooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex items-center gap-4 mt-8 flex-wrap"
          >
            {/* Total Rooms */}
            <div className="glass rounded-xl p-4 flex items-center gap-3 min-w-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Database size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {rooms.length}
                </div>
                <div className="text-[11px] text-muted/60 font-medium">
                  Total Rooms
                </div>
              </div>
            </div>

            {/* Protected */}
            {protectedCount > 0 && (
              <div className="glass rounded-xl p-4 flex items-center gap-3 min-w-[140px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/15 ring-1 ring-amber-400/20">
                  <Lock size={18} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground tabular-nums">
                    {protectedCount}
                  </div>
                  <div className="text-[11px] text-muted/60 font-medium">
                    Protected
                  </div>
                </div>
              </div>
            )}

            {/* Total Files */}
            <div className="glass rounded-xl p-4 flex items-center gap-3 min-w-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-blue-500/20">
                <FileText size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {totalFiles}
                </div>
                <div className="text-[11px] text-muted/60 font-medium">
                  Total Files
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Gradient divider */}
      <div className="divider-gradient mb-8" />

      {/* Toolbar */}
      {rooms.length > 0 && (
        <HomeToolbar onCreateNew={() => setCreateOpen(true)} />
      )}

      {/* Filter result count */}
      {isFiltering && rooms.length > 0 && (
        <p className="text-xs text-muted/50 mb-4">
          Showing {filteredRooms.length} of {rooms.length} room
          {rooms.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {status === 'loading' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 card-premium inner-glow-purple"
            >
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
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted/60 text-sm">
            No rooms match your current filters.
          </p>
          <button
            onClick={() => dispatch(setHomeSearchQuery(''))}
            className="text-primary text-sm mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredRooms.map((room, i) => (
            <DataRoomCard
              key={room.id}
              dataRoom={room}
              onRename={handleRename}
              onDelete={handleDelete}
              stats={roomStats[room.id]}
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
