import {
  NormalizerOptions,
  NormalizerResult,
  INormalizerPlugin,
} from "./types";
import { parseValue, resolveMessage } from "./utils";
import { PluginRegistry } from "./plugins";

export class InputNormalizer {
  private options: NormalizerOptions;
  private result?: Record<string, any>;

  constructor(options: NormalizerOptions = {}) {
    const mergedPlugins = [
      ...PluginRegistry.getAll(), // global plugins
      ...(options.plugins || []), // instance plugins
    ];

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
      plugins: mergedPlugins,
      ...options,
    };
  }

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

      if (Array.isArray(whitelist) && !whitelist.includes(key)) continue;
      if (Array.isArray(blacklist) && blacklist.includes(key)) continue;

      this.dispatchPlugin("beforeFieldNormalize", {
        key,
        rawValue: input[key],
        options: this.options,
      });

      let rawVal = input[key];

      if (typeof fieldTransformers?.[key] === "function") {
        rawVal = fieldTransformers[key](rawVal);
      }

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

      if (typeof schemaFallbacks?.[key] === "function") {
        normalizedVal = schemaFallbacks[key](normalizedVal);
      }

      const isValid =
        typeof validators?.[key] === "function"
          ? validators[key](normalizedVal)
          : true;

      if (!isValid) {
        const message = resolveMessage(
          key,
          "invalid",
          normalizedVal,
          this.options.messages
        );

        if (validationMode === "strict") {
          throw new Error(message);
        }

        if (validationMode === "collect") {
          errors[key] = message;

          this.dispatchPlugin("onValidationError", {
            key,
            error: message,
            currentValue: normalizedVal,
          });
        }
      }

      if (
        (normalizedVal === null || normalizedVal === undefined) &&
        Object.prototype.hasOwnProperty.call(defaultValues, key)
      ) {
        normalizedVal = defaultValues[key];
      }

      if (normalizedVal === undefined && removeUndefinedFields) {
        continue;
      }

      result[key] = normalizedVal;

      this.dispatchPlugin("afterFieldNormalize", {
        key,
        normalizedValue: normalizedVal,
        rawValue: input[key],
        result,
      });
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

    this.dispatchPlugin("afterNormalize", {
      result,
      errors,
    });

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
        // const originalMessage = schemaErrors[key];
        const value = targetResult[key];

        const message = resolveMessage(
          key,
          "schema",
          value,
          this.options.messages
        );

        collector[key] = message;

        this.dispatchPlugin("onValidationError", {
          key,
          error: message,
          currentValue: value,
        });

        const fallbackFn = this.options.schemaFallbacks?.[key];
        if (typeof fallbackFn === "function") {
          const currentValue = targetResult[key];
          targetResult[key] = fallbackFn(currentValue);
        }
      }
    }
  }

  private dispatchPlugin<K extends keyof INormalizerPlugin>(
    hook: K,
    payload: Parameters<Required<INormalizerPlugin>[K]>[0]
  ) {
    this.options.plugins?.forEach((plugin) => {
      plugin[hook]?.(payload as any);
    });
  }
}
