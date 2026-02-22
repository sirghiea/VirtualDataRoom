/**
 * Shared validation schemas powered by Zod.
 * The `validateName` wrapper preserves the existing API so consumers
 * (CreateDataRoomDialog, RenameDialog, etc.) need zero changes.
 */

import { z } from 'zod';

const RESERVED_NAMES = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'lpt1', 'lpt2', 'lpt3'];

// eslint-disable-next-line no-control-regex
const INVALID_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1F]/;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  error: string;
}

// ---------------------------------------------------------------------------
// Name schema factory (internal)
// ---------------------------------------------------------------------------

function createNameSchema(options: {
  minLength: number;
  maxLength: number;
  entityLabel: string;
  existingNames: string[];
  currentName?: string;
}) {
  const { minLength, maxLength, entityLabel, existingNames, currentName } = options;
  const label = capitalize(entityLabel);

  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(minLength, `${label} must be at least ${minLength} characters`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
    .refine((v) => !INVALID_CHARS_REGEX.test(v), {
      message: `${label} contains invalid characters (< > : " / \\ | ? *)`,
    })
    .refine((v) => !v.startsWith('.') && !v.endsWith('.'), {
      message: `${label} cannot start or end with a dot`,
    })
    .superRefine((v, ctx) => {
      // Reserved names — dynamic message includes the value
      if (RESERVED_NAMES.includes(v.toLowerCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `"${v}" is a reserved name`,
        });
        return;
      }

      // Duplicate check
      if (existingNames.length > 0) {
        const isDuplicate = existingNames.some(
          (n) =>
            n.toLowerCase() === v.toLowerCase() &&
            (!currentName || n.toLowerCase() !== currentName.toLowerCase()),
        );
        if (isDuplicate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `A ${entityLabel.toLowerCase()} with this name already exists`,
          });
        }
      }
    });
}

// ---------------------------------------------------------------------------
// Public API — same signature as before
// ---------------------------------------------------------------------------

export function validateName(
  name: string,
  options: {
    minLength?: number;
    maxLength?: number;
    entityLabel?: string;
    existingNames?: string[];
    currentName?: string;
  } = {},
): ValidationResult {
  const {
    minLength = 2,
    maxLength = 255,
    entityLabel = 'name',
    existingNames = [],
    currentName,
  } = options;

  const schema = createNameSchema({ minLength, maxLength, entityLabel, existingNames, currentName });
  const result = schema.safeParse(name);

  if (result.success) {
    return { valid: true, error: '' };
  }

  return { valid: false, error: result.error.issues[0].message };
}

// ---------------------------------------------------------------------------
// Password schema — used by PasswordDialog
// ---------------------------------------------------------------------------

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be 128 characters or fewer')
  .refine((v) => /[A-Z]/.test(v), {
    message: 'Must contain at least one uppercase letter',
  })
  .refine((v) => /[a-z]/.test(v), {
    message: 'Must contain at least one lowercase letter',
  })
  .refine((v) => /[0-9]/.test(v), {
    message: 'Must contain at least one number',
  });

/**
 * Password strength checks — used by the strength meter UI.
 * Each check returns true when satisfied.
 */
export const PASSWORD_CHECKS = [
  { label: '6+ characters', test: (v: string) => v.length >= 6 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/**
 * Calculate password strength score (0–5).
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };
  const score = PASSWORD_CHECKS.filter((c) => c.test(password)).length;
  if (score <= 1) return { score, label: 'Very weak', color: 'text-red-400' };
  if (score === 2) return { score, label: 'Weak', color: 'text-orange-400' };
  if (score === 3) return { score, label: 'Fair', color: 'text-amber-400' };
  if (score === 4) return { score, label: 'Strong', color: 'text-emerald-400' };
  return { score, label: 'Very strong', color: 'text-emerald-300' };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
