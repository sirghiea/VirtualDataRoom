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
// Password schema — used by PasswordDialog (Phase 3)
// ---------------------------------------------------------------------------

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(4, 'Password must be at least 4 characters')
  .max(128, 'Password must be 128 characters or fewer');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
