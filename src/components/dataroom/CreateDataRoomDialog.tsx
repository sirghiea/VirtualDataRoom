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
import { validateName } from '@/lib/validation';

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
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const existingRooms = useAppSelector((s) => s.dataRooms.rooms);

  const existingNames = existingRooms.map((r) => r.name);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName('');
      setError('');
      setShowError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onCancel();
    }
  };

  const runValidation = (value: string) => {
    const result = validateName(value, {
      entityLabel: 'Data room name',
      existingNames,
      minLength: 2,
      maxLength: 255,
    });
    setError(result.error);
    return result.valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setShowError(false);
    // Validate silently (for button disable state) but don't show error
    if (val.length > 0) {
      runValidation(val);
    } else {
      setError('');
    }
  };

  const handleBlur = () => {
    if (name.trim().length > 0) {
      runValidation(name);
      setShowError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (runValidation(trimmed)) {
      onSubmit(trimmed);
      setName('');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const charCount = name.trim().length;
  const isValid = !error && charCount >= 2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Data Room</DialogTitle>
          <DialogDescription>Enter a name for your new data room.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mt-2">
            <Input
              ref={inputRef}
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Project Alpha Due Diligence"
              maxLength={255}
              autoFocus
              className={error && showError ? 'border-destructive/50 focus-visible:ring-destructive/40' : ''}
            />
            <div className="flex items-center justify-between mt-2 min-h-[20px]">
              {error && showError ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : (
                <p className="text-[11px] text-muted/50">&nbsp;</p>
              )}
              <span className={`text-[10px] tabular-nums ${charCount > 240 ? 'text-amber-400' : 'text-muted/40'}`}>
                {charCount > 0 ? `${charCount}/255` : ''}
              </span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
