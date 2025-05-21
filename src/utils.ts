import { MessageSource, NormalizerOptions } from "./types";

/**
 * Parses a single string value into a normalized type (boolean, number, date, null, etc.)
 */
function parseValue(
  value: any,
  key: string | null,
  options: NormalizerOptions
): any {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const lowered = trimmed.toLowerCase();

  // Handle empty string
  if (trimmed === "") {
    if (options.treatEmptyStringAs === "null") return null;
    if (options.treatEmptyStringAs === "undefined") return undefined;
    return value;
  }

  // Boolean
  if (options.convertBooleans) {
    if (lowered === "true")
      return options.fieldParsers?.boolean?.(true) ?? true;
    if (lowered === "false")
      return options.fieldParsers?.boolean?.(false) ?? false;
  }

  // Null / undefined
  if (options.convertNulls) {
    if (lowered === "null") return null;
    if (lowered === "undefined") return undefined;
  }

  // Number
  if (options.convertNumbers && !isNaN(trimmed as any)) {
    const numberVal = Number(trimmed);
    return options.fieldParsers?.number?.(numberVal) ?? numberVal;
  }

  // ISO Date
  if (options.enableDateParsing && isIsoDate(trimmed)) {
    const dateVal = new Date(trimmed);
    return options.fieldParsers?.date?.(dateVal) ?? dateVal;
  }

  // JSON parse
  if (options.enableJsonParsing) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed;
    } catch (_) {
      // Not a valid JSON string — skip
    }
  }

  return options.fieldParsers?.string?.(trimmed) ?? trimmed;
}

interface PasswordValidatorOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}

function createPasswordValidator(options: PasswordValidatorOptions = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumber = true,
    requireSymbol = true,
  } = options;

  return (val: any): boolean => {
    if (typeof val !== "string") return false;
    if (val.length < minLength) return false;
    if (requireUppercase && !/[A-Z]/.test(val)) return false;
    if (requireNumber && !/[0-9]/.test(val)) return false;
    if (requireSymbol && !/[^a-zA-Z0-9]/.test(val)) return false;
    return true;
  };
}

function createEmailValidator(): (val: any) => boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (val: any): boolean => typeof val === "string" && emailRegex.test(val);
}

interface UsernameValidatorOptions {
  minLength?: number;
  maxLength?: number;
  allowUnderscore?: boolean;
  allowDigits?: boolean;
}

function createUsernameValidator(options: UsernameValidatorOptions = {}) {
  const {
    minLength = 3,
    maxLength = 30,
    allowUnderscore = true,
    allowDigits = true,
  } = options;

  return (val: any): boolean => {
    if (typeof val !== "string") return false;
    if (val.length < minLength || val.length > maxLength) return false;

    let pattern = `^[a-zA-Z${allowUnderscore ? "_" : ""}${
      allowDigits ? "0-9" : ""
    }]+$`;
    return new RegExp(pattern).test(val);
  };
}

interface PhoneValidatorOptions {
  allowPlusPrefix?: boolean;
  minDigits?: number;
  maxDigits?: number;
}

function createPhoneValidator(options: PhoneValidatorOptions = {}) {
  const { allowPlusPrefix = true, minDigits = 9, maxDigits = 15 } = options;

  const pattern = allowPlusPrefix
    ? new RegExp(`^\\+?[0-9]{${minDigits},${maxDigits}}$`)
    : new RegExp(`^[0-9]{${minDigits},${maxDigits}}$`);

  return (val: any): boolean => typeof val === "string" && pattern.test(val);
}

function isIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value) ||
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}

function resolveMessage(
  key: string,
  type: "invalid" | "required" | "schema",
  value: any,
  messages?: Record<string, any> | ((params: any) => string),
  language: string = "en"
): string | undefined {
  const code = `${key}.${type}`;
  if (!messages) return;

  if (typeof messages === "function") {
    return messages({ key, type, value, language });
  }

  if (typeof messages === "object") {
    const langSet = messages?.[language] || messages?.["en"] || messages;
    return langSet[code] || langSet[key];
  }

  return;
}

export {
  parseValue,
  createPasswordValidator,
  createEmailValidator,
  createUsernameValidator,
  createPhoneValidator,
  isIsoDate,
  resolveMessage,
};
