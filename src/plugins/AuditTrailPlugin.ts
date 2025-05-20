import { INormalizerPlugin } from "../types";

export const createAuditTrailPlugin = (log: any[] = []): INormalizerPlugin => ({
  afterFieldNormalize: ({ key, normalizedValue, rawValue }) => {
    if (normalizedValue !== rawValue) {
      log.push({ key, from: rawValue, to: normalizedValue });
    }
  },
  afterNormalize: () => {
    log.push({ timestamp: Date.now(), done: true });
  },
});
