import { useState, useRef, useEffect } from 'react';

interface RenameDialogProps {
  open: boolean;
  title: string;
  currentName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export default function RenameDialog({
  open,
  title,
  currentName,
  onSave,
  onCancel,
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setTimeout(() => inputRef.current?.select(), 0);
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== currentName) {
      onSave(trimmed);
    } else {
      onCancel();
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
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
