import { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, KeyRound, Unlock } from 'lucide-react';
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
import { passwordSchema } from '@/lib/validation';

export type PasswordMode = 'set' | 'unlock' | 'change' | 'remove';

interface PasswordDialogProps {
  open: boolean;
  mode: PasswordMode;
  onSubmit: (password: string, newPassword?: string) => void;
  onCancel: () => void;
  /** External error, e.g. "Incorrect password" from parent */
  error?: string;
}

const MODE_CONFIG: Record<
  PasswordMode,
  { title: string; description: string; icon: typeof Lock; submitLabel: string }
> = {
  set: {
    title: 'Set Password',
    description: 'Protect this data room with a password.',
    icon: Lock,
    submitLabel: 'Set Password',
  },
  unlock: {
    title: 'Enter Password',
    description: 'This data room is password protected.',
    icon: KeyRound,
    submitLabel: 'Unlock',
  },
  change: {
    title: 'Change Password',
    description: 'Enter your current password and choose a new one.',
    icon: ShieldCheck,
    submitLabel: 'Change Password',
  },
  remove: {
    title: 'Remove Password',
    description: 'Enter your current password to remove protection.',
    icon: Unlock,
    submitLabel: 'Remove Password',
  },
};

export default function PasswordDialog({
  open,
  mode,
  onSubmit,
  onCancel,
  error: externalError,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  // Derive displayed password error: prefer external error over internal
  const displayedErrors = externalError
    ? { ...errors, password: externalError }
    : errors;
  const displayedShowErrors = externalError
    ? { ...showErrors, password: true }
    : showErrors;

  // Reset when external error comes in — mark submitting false
  const effectiveSubmitting = externalError ? false : submitting;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset state when dialog opens
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowNewPassword(false);
      setErrors({});
      setShowErrors({});
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onCancel();
    }
  };

  const validateField = (field: string, value: string): string => {
    if (field === 'confirm') {
      if (!value) return 'Please confirm your password';
      if (value !== (mode === 'change' ? newPassword : password)) return 'Passwords do not match';
      return '';
    }
    const result = passwordSchema.safeParse(value);
    if (result.success) return '';
    return result.error.issues[0].message;
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'password') setPassword(value);
    else if (field === 'newPassword') setNewPassword(value);
    else if (field === 'confirm') setConfirmPassword(value);

    // Validate silently (for button disable), hide error
    setShowErrors((prev) => ({ ...prev, [field]: false }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFieldBlur = (field: string, value: string) => {
    if (value.trim().length > 0) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
      setShowErrors((prev) => ({ ...prev, [field]: true }));
    }
  };

  const getFieldsForMode = (): string[] => {
    switch (mode) {
      case 'set':
        return ['password', 'confirm'];
      case 'unlock':
        return ['password'];
      case 'change':
        return ['password', 'newPassword', 'confirm'];
      case 'remove':
        return ['password'];
    }
  };

  const isFormValid = (): boolean => {
    const fields = getFieldsForMode();
    for (const field of fields) {
      const value =
        field === 'password' ? password : field === 'newPassword' ? newPassword : confirmPassword;
      if (!value.trim()) return false;
      if (errors[field]) return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fields = getFieldsForMode();
    let hasError = false;

    for (const field of fields) {
      const value =
        field === 'password' ? password : field === 'newPassword' ? newPassword : confirmPassword;
      const err = validateField(field, value);
      if (err) {
        setErrors((prev) => ({ ...prev, [field]: err }));
        setShowErrors((prev) => ({ ...prev, [field]: true }));
        hasError = true;
      }
    }

    if (hasError) return;

    setSubmitting(true);

    switch (mode) {
      case 'set':
        onSubmit(password);
        break;
      case 'unlock':
        onSubmit(password);
        break;
      case 'change':
        onSubmit(password, newPassword);
        break;
      case 'remove':
        onSubmit(password);
        break;
    }
  };

  const renderField = (
    field: string,
    label: string,
    value: string,
    show: boolean,
    toggleShow: () => void,
    placeholder: string,
    ref?: React.RefObject<HTMLInputElement | null>,
  ) => (
    <div>
      <label className="text-xs font-medium text-muted/80 mb-1.5 block">{label}</label>
      <div className="relative">
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          onBlur={() => handleFieldBlur(field, value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`pr-10 ${displayedErrors[field] && displayedShowErrors[field] ? 'border-destructive/50 focus-visible:ring-destructive/40' : ''}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={toggleShow}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <div className="min-h-[18px] mt-1">
        {displayedErrors[field] && displayedShowErrors[field] ? (
          <p className="text-xs text-destructive">{displayedErrors[field]}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription className="mt-0.5">{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mt-3 space-y-3">
            {/* Current / main password */}
            {renderField(
              'password',
              mode === 'change' ? 'Current Password' : 'Password',
              password,
              showPassword,
              () => setShowPassword((v) => !v),
              mode === 'set' ? 'Choose a password' : 'Enter password',
              inputRef,
            )}

            {/* New password (change mode) */}
            {mode === 'change' &&
              renderField(
                'newPassword',
                'New Password',
                newPassword,
                showNewPassword,
                () => setShowNewPassword((v) => !v),
                'Choose a new password',
              )}

            {/* Confirm (set & change modes) */}
            {(mode === 'set' || mode === 'change') &&
              renderField(
                'confirm',
                'Confirm Password',
                confirmPassword,
                mode === 'set' ? showPassword : showNewPassword,
                mode === 'set'
                  ? () => setShowPassword((v) => !v)
                  : () => setShowNewPassword((v) => !v),
                'Confirm password',
              )}
          </div>

          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || effectiveSubmitting}>
              {effectiveSubmitting ? 'Please wait...' : config.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
