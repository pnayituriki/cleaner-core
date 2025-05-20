import { INormalizerPlugin } from "../types";

export const SanitizerPlugin: INormalizerPlugin = {
  beforeFieldNormalize: ({ key, rawValue, options }) => {
    if (typeof rawValue === "string") {
      const isEmail = key.toLowerCase().includes("email");
      const existing = options.fieldTransformers?.[key];

      options.fieldTransformers = {
        ...options.fieldTransformers,
        [key]: (v: string) => {
          let val = typeof existing === "function" ? existing(v) : v;

          val = val.trim(); // always trim
          if (isEmail) val = val.toLowerCase(); // lowercase emails

          return val;
        },
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
