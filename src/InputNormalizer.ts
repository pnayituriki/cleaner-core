import { NormalizerOptions, NormalizerResult } from "./types";
import { parseValue } from "./utils";

export class InputNormalizer {
  private options: NormalizerOptions;
  private result?: Record<string, any>;

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
  normalize<T = any>(input: Record<string, any>): NormalizerResult<T> {
    const result: Record<string, any> = {};
    this.result = result;
    const errors: Record<string, string> = {};

    const {
      whitelist,
      blacklist,
      fieldTransformers,
      schemaFallbacks,
      defaultValues = {},
      validators,
      validationMode,
      removeUndefinedFields,
    } = this.options;

    for (const key in input) {
      if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

      // ✅ Skip if not in whitelist
      if (Array.isArray(whitelist) && !whitelist.includes(key)) continue;

      // ✅ Skip if in blacklist
      if (Array.isArray(blacklist) && blacklist.includes(key)) continue;

      let rawVal = input[key];

      // ✅ Apply field transformer
      if (typeof fieldTransformers?.[key] === "function") {
        rawVal = fieldTransformers[key](rawVal);
      }

      // ✅ Normalize the value
      let normalizedVal: any;
      if (Array.isArray(rawVal)) {
        normalizedVal = rawVal.map((v) =>
          this.isObject(v)
            ? this.normalize(v).result
            : parseValue(v, key, this.options)
        );
      } else if (this.isObject(rawVal)) {
        normalizedVal = this.normalize(rawVal).result;
      } else {
        normalizedVal = parseValue(rawVal, key, this.options);
      }

      // ✅ Schema fallback
      if (typeof schemaFallbacks?.[key] === "function") {
        normalizedVal = schemaFallbacks[key](normalizedVal);
      }

      // ✅ Validation
      const isValid =
        typeof validators?.[key] === "function"
          ? validators[key](normalizedVal)
          : true;

      if (!isValid) {
        if (validationMode === "strict") {
          throw new Error(`Validation failed for field "${key}"`);
        }
        if (validationMode === "collect") {
          errors[key] = `Validation failed for field "${key}"`;
        }
      }

      // ✅ Default value if null/undefined
      if (
        (normalizedVal === null || normalizedVal === undefined) &&
        Object.prototype.hasOwnProperty.call(defaultValues, key)
      ) {
        normalizedVal = defaultValues[key];
      }

      // ✅ Omit if undefined and configured
      if (normalizedVal === undefined && removeUndefinedFields) {
        continue;
      }

      result[key] = normalizedVal;
    }

    if (this.options.schema) {
      const { type, validator } = this.options.schema;

      try {
        if (type === "zod") {
          const parseResult = validator.safeParse(result);
          if (!parseResult.success) {
            const formattedErrors = Object.fromEntries(
              parseResult.error.errors.map((e: any) => [
                e.path.join("."),
                e.message,
              ])
            );
            this._handleSchemaErrors(formattedErrors, errors, result);
          }
        } else if (type === "yup") {
          try {
            validator.validateSync(result, { abortEarly: false });
          } catch (yupErr: any) {
            const formattedErrors = (yupErr?.inner || []).reduce(
              (acc: any, err: any) => {
                acc[err.path] = err.message;
                return acc;
              },
              {}
            );
            this._handleSchemaErrors(formattedErrors, errors, result);
          }
        } else if (
          type === "custom" &&
          typeof validator.validate === "function"
        ) {
          const validationResult = validator.validate(result);
          if (!validationResult.valid) {
            this._handleSchemaErrors(validationResult.errors, errors, result);
          }
        }
      } catch (e) {
        if (this.options.validationMode === "strict") {
          throw new Error(`Schema validation failed: ${(e as Error).message}`);
        }
      }
    }

    return {
      result: result as T,
      ...(Object.keys(errors).length > 0 && validationMode === "collect"
        ? { errors }
        : {}),
    };
  }

  private isObject(value: any): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private _handleSchemaErrors(
    schemaErrors: Record<string, string>,
    collector: Record<string, string>,
    targetResult: Record<string, any>
  ) {
    const mode = this.options.validationMode;
    if (mode === "strict") {
      throw new Error(
        `Schema validation failed: ${JSON.stringify(schemaErrors)}`
      );
    }
    if (mode === "collect") {
      for (const key in schemaErrors) {
        collector[key] = schemaErrors[key];

        // 🔁 Fallback if defined for invalid field
        const fallbackFn = this.options.schemaFallbacks?.[key];
        if (typeof fallbackFn === "function") {
          // apply fallback to result directly
          const currentValue = targetResult?.[key];
          targetResult[key] = fallbackFn(currentValue);
        }
      }
    }
  }
}
