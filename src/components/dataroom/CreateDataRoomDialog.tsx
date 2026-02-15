import { useState, useRef, useEffect } from 'react';

interface CreateDataRoomDialogProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export default function CreateDataRoomDialog({
  open,
  onSubmit,
  onCancel,
}: CreateDataRoomDialogProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setName('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setName('');
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="fixed inset-0 z-50 m-auto max-w-md glass-strong rounded-2xl p-0 shadow-2xl shadow-black/50 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Create Data Room</h2>
        <p className="mt-1 text-sm text-muted">
          Enter a name for your new data room.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Project Alpha Due Diligence"
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 placeholder:text-muted-foreground transition-all"
          maxLength={255}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-lg bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary disabled:opacity-30 transition-all shadow-lg shadow-primary/20"
          >
            Create
          </button>
        </div>
      </form>
    </dialog>
  );
}
