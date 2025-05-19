import type { ZodType } from "zod";

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
export type SchemaType = "zod" | "yup" | "custom";
export type SchemaFallbackFn = (val: any) => any;

export interface NormalizerSchema {
  type: SchemaType;
  validator: any; // Accepts Zod, Yup, or custom validator with .validate()
}

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
  schema?: NormalizerSchema;

  plugins?: INormalizerPlugin[];
}

/** Result object from normalization */
export interface NormalizerResult<T = any> {
  result: T;
  errors?: ValidationErrorMap;
}

export interface ValidationErrorMap {
  [field: string]: string;
}

export interface INormalizerPlugin {
  beforeFieldNormalize?: (context: {
    key: string;
    rawValue: any;
    options: NormalizerOptions;
  }) => void;

  afterFieldNormalize?: (context: {
    key: string;
    normalizedValue: any;
    rawValue: any;
    result: Record<string, any>;
  }) => void;

  onValidationError?: (context: {
    key: string;
    error: string;
    currentValue: any;
  }) => void;

  afterNormalize?: (context: {
    result: Record<string, any>;
    errors: Record<string, string>;
  }) => void;
}
