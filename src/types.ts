/** Validation modes */
export type ValidationMode = "none" | "collect" | "strict";

/** Supported type parsers */
export interface FieldParsers {
  string?: (val: string) => any;
  number?: (val: number) => any;
  boolean?: (val: boolean) => any;
  date?: (val: Date) => any;
}

/** Custom validator function: returns true if valid */
export type ValidatorFn = (val: any) => boolean;

/** Custom fallback handler when validation fails */
export type SchemaFallbackFn = (val: any) => any;

/** Normalizer config options */
export interface NormalizerOptions {
  treatEmptyStringAs?: "null" | "undefined" | "keep";
  removeUndefinedFields?: boolean;
  enableDateParsing?: boolean;
  enableJsonParsing?: boolean;
  convertNumbers?: boolean;
  convertBooleans?: boolean;
  convertNulls?: boolean;

  whitelist?: string[] | null;
  blacklist?: string[] | null;

  fieldTransformers?: Record<string, (val: any) => any>;
  fieldParsers?: FieldParsers;

  defaultValues?: Record<string, any>;
  schemaFallbacks?: Record<string, SchemaFallbackFn>;
  validators?: Record<string, ValidatorFn>;

  validationMode?: ValidationMode;
}

/** Result object from normalization */
export interface NormalizerResult<T = any> {
  result: T;
  errors?: Record<string, string>; // Only populated in `collect` mode
}
