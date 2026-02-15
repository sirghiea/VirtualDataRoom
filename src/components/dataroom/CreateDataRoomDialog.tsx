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
      className="fixed inset-0 z-50 m-auto max-w-md rounded-lg border bg-background p-0 shadow-lg backdrop:bg-black/50"
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
          className="mt-4 w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          maxLength={255}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </dialog>
  );
}
