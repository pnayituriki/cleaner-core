# 🔌 Plugin System Guide

The `formulate` plugin system allows developers to hook into the normalization lifecycle to:
- Log field-level operations
- Audit changes
- Sanitize inputs dynamically

## ✅ Available Hooks

Each plugin can implement one or more of the following lifecycle hooks:

```ts
interface INormalizerPlugin {
  beforeFieldNormalize?: (ctx: { key: string; rawValue: any; options: NormalizerOptions }) => void;
  afterFieldNormalize?: (ctx: { key: string; normalizedValue: any; rawValue: any; result: any }) => void;
  onValidationError?: (ctx: { key: string; error: string; currentValue: any }) => void;
  afterNormalize?: (ctx: { result: any; errors: Record<string, string> }) => void;
}
```

## 🧱 Example Plugin: LoggerPlugin

```ts
export const LoggerPlugin = {
  beforeFieldNormalize: ({ key, rawValue }) => {
    console.log(`[Logger] Normalizing field: ${key}`, rawValue);
  },
  afterFieldNormalize: ({ key, normalizedValue }) => {
    console.log(`[Logger] → ${key}:`, normalizedValue);
  },
  onValidationError: ({ key, error }) => {
    console.warn(`[Logger] ❌ Validation failed on ${key}: ${error}`);
  },
  afterNormalize: ({ result }) => {
    console.log(`[Logger] ✅ Final Result:`, result);
  },
};
```

## ✍️ Writing Your Own Plugin

1. Define an object implementing `INormalizerPlugin`
2. Use hooks as needed.
3. Pass via `plugins: [...]` option:

```ts
const normalizer = new InputNormalizer({
  plugins: [LoggerPlugin]
});
```

You can also register global plugins via `PluginRegistry.register()`.

---
