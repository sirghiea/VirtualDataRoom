import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import DataRoomCard from '@/components/dataroom/DataRoomCard';
import CreateDataRoomDialog from '@/components/dataroom/CreateDataRoomDialog';
import EmptyState from '@/components/shared/EmptyState';

export default function HomePage() {
  const { state, loadDataRooms, createDataRoom, renameDataRoom, removeDataRoom } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDataRooms();
  }, [loadDataRooms]);

  const handleCreate = async (name: string) => {
    const room = await createDataRoom(name);
    setCreateOpen(false);
    navigate(`/dataroom/${room.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Rooms</h1>
          <p className="text-sm text-muted mt-1">
            Manage your secure document repositories
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} />
          New Data Room
        </button>
      </div>

      {state.isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : state.dataRooms.length === 0 ? (
        <EmptyState
          icon={<Database size={48} />}
          title="No data rooms yet"
          description="Create your first data room to start organizing and sharing documents securely."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              <Plus size={16} />
              Create Data Room
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.dataRooms.map((room) => (
            <DataRoomCard
              key={room.id}
              dataRoom={room}
              onRename={renameDataRoom}
              onDelete={removeDataRoom}
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
