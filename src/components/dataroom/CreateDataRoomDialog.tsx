import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

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
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const existingRooms = useAppSelector((s) => s.dataRooms.rooms);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onCancel();
    }
  };

  const validate = (value: string) => {
    const trimmed = value.trim();
    if (existingRooms.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A data room with this name already exists');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && validate(trimmed)) {
      onSubmit(trimmed);
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Data Room</DialogTitle>
          <DialogDescription>Enter a name for your new data room.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) validate(e.target.value);
            }}
            placeholder="e.g., Project Alpha Due Diligence"
            maxLength={255}
            className="mt-2"
            autoFocus
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !!error}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
