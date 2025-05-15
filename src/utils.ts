import { NormalizerOptions } from "./types";

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value);
}

/**
 * Parses a single string value into a normalized type (boolean, number, date, null, etc.)
 */
export function parseValue(
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
