import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateName } from '@/lib/validation';

interface RenameDialogProps {
  open: boolean;
  title: string;
  currentName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  /** Existing names for duplicate checking */
  existingNames?: string[];
  /** Label for the entity (e.g., "Folder", "Data room") */
  entityLabel?: string;
}

export default function RenameDialog({
  open,
  title,
  currentName,
  onSave,
  onCancel,
  existingNames = [],
  entityLabel = 'name',
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName(currentName);
      setError('');
      setShowError(false);
      setTimeout(() => inputRef.current?.select(), 100);
    } else {
      onCancel();
    }
  };

  const runValidation = (value: string) => {
    const result = validateName(value, {
      entityLabel,
      existingNames,
      currentName,
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
    if (trimmed === currentName) {
      onCancel();
      return;
    }
    if (runValidation(trimmed)) {
      onSave(trimmed);
    } else {
      setShowError(true);
    }
  };

  const charCount = name.trim().length;
  const isUnchanged = name.trim() === currentName;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mt-2">
            <Input
              ref={inputRef}
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
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
            <Button type="submit" disabled={!name.trim() || !!error || isUnchanged}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
