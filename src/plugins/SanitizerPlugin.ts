import { INormalizerPlugin } from "../types";

export const SanitizerPlugin: INormalizerPlugin = {
  beforeFieldNormalize: ({ key, rawValue, options }) => {
    if (typeof rawValue === "string") {
      const prevTransformer = options.fieldTransformers?.[key];

      const newTransformer = (val: string) => {
        let transformed = val.trim();
        if (key.toLowerCase().includes("email")) {
          transformed = transformed.toLowerCase();
        }
        return typeof prevTransformer === "function"
          ? prevTransformer(transformed)
          : transformed;
      };

      options.fieldTransformers = {
        ...options.fieldTransformers,
        [key]: newTransformer,
      };
    }
  },
  afterFieldNormalize: ({ key, rawValue, normalizedValue, result }) => {
    if (typeof normalizedValue === "string") {
      const trimmed = normalizedValue.trim();
      const isEmail = key.toLowerCase().includes("email");
      const sanitized = isEmail ? trimmed.toLowerCase() : trimmed;

      result[key] = sanitized;
    }
  },
};
