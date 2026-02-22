/**
 * Shared naming validation rules for data rooms, folders, and files.
 */

const RESERVED_NAMES = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'lpt1', 'lpt2', 'lpt3'];

// eslint-disable-next-line no-control-regex
const INVALID_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1F]/;

export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateName(
  name: string,
  options: {
    minLength?: number;
    maxLength?: number;
    entityLabel?: string;
    existingNames?: string[];
    currentName?: string;
  } = {}
): ValidationResult {
  const {
    minLength = 2,
    maxLength = 255,
    entityLabel = 'name',
    existingNames = [],
    currentName,
  } = options;

  const trimmed = name.trim();

  // Empty check
  if (!trimmed) {
    return { valid: false, error: `${capitalize(entityLabel)} is required` };
  }

  // Min length
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${capitalize(entityLabel)} must be at least ${minLength} characters`,
    };
  }

  // Max length
  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${capitalize(entityLabel)} must be ${maxLength} characters or fewer`,
    };
  }

  // Invalid characters
  if (INVALID_CHARS_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${capitalize(entityLabel)} contains invalid characters (< > : " / \\ | ? *)`,
    };
  }

  // No leading/trailing dots or spaces
  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return {
      valid: false,
      error: `${capitalize(entityLabel)} cannot start or end with a dot`,
    };
  }

  // Reserved names
  if (RESERVED_NAMES.includes(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: `"${trimmed}" is a reserved name`,
    };
  }

  // Duplicate check
  if (existingNames.length > 0) {
    const isDuplicate = existingNames.some(
      (n) =>
        n.toLowerCase() === trimmed.toLowerCase() &&
        (!currentName || n.toLowerCase() !== currentName.toLowerCase())
    );
    if (isDuplicate) {
      return {
        valid: false,
        error: `A ${entityLabel.toLowerCase()} with this name already exists`,
      };
    }
  }

  return { valid: true, error: '' };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
