import { NormalizerOptions, NormalizerResult } from "./types";

export class InputNormalizer {
  private options: NormalizerOptions;

  constructor(options: NormalizerOptions = {}) {
    this.options = {
      treatEmptyStringAs: "null",
      removeUndefinedFields: false,
      enableDateParsing: true,
      enableJsonParsing: true,
      convertNumbers: true,
      convertBooleans: true,
      convertNulls: true,
      whitelist: null,
      blacklist: null,
      fieldTransformers: {},
      fieldParsers: {},
      defaultValues: {},
      schemaFallbacks: {},
      validators: {},
      validationMode: "none",
      ...options,
    };
  }

  /** Main normalization method */
  normalize<T = any>(input:Record<string,any>):NormalizerResult<T>{
    // 🧪 For now, just return the original input until logic is implemented
    return {
      result: input as T,
    };
  }
}
