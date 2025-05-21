import { INormalizerPlugin } from "../types";

export const LoggerPlugin: INormalizerPlugin = {
  beforeFieldNormalize: ({ key, rawValue }) => {
    console.log(`[Logger] Normalizing field: ${key}`, rawValue);
  },
  afterFieldNormalize: ({ key, normalizedValue }) => {
    console.log(`[Logger] → ${key}:`, normalizedValue);
  },
  onValidationError: ({ key, error }) => {
    // console.warn(`[Logger] ⚠️ Validation failed: ${key} — ${error}`);
    console.warn(`[Logger] ❌ ${key}: ${error}`);
  },
  afterNormalize: ({ result, errors }) => {
    console.log(`[Logger] ✅ Final Result:`, result);
    if (Object.keys(errors).length) {
      console.warn(`[Logger] ❌ Errors:`, errors);
    }
  },
};
