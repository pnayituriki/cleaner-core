# @cleaner/core

**@cleaner/core** is a framework-agnostic, TypeScript-first input normalization and validation library.  
It helps you convert raw user inputs (usually strings from `req.query`, `req.body`, or forms) into well-typed, validated, and sanitized JavaScript objects.

---

## ✨ Features

- 🔁 Converts strings into `boolean`, `number`, `Date`, `null`, etc.
- 📦 Supports nested objects and arrays
- 🧩 Custom field transformers and type parsers
- 🚦 Built-in validation with error collection or strict mode
- 🛡️ Schema fallback and default value injection
- 🔍 Whitelist/blacklist support
- 💡 Dual API: **OOP** and **functional**
- ⚙️ Ready for Express, React, Next.js, Vue, NestJS, and any JS/TS stack

---

## 📦 Installation

```bash
npm install @cleaner/core
# or
yarn add @cleaner/core

---

## 🔧 Usage

### 🔹 Functional API

```ts
import { normalize } from '@cleaner/core';

const { result, errors } = normalize(req.query, {
  convertBooleans: true,
  convertNumbers: true,
  validationMode: 'collect',
  validators: {
    age: (val) => val >= 18,
  },
});
```

---

### 🔹 OOP API

```ts
import { InputNormalizer } from '@cleaner/core';

const normalizer = new InputNormalizer({
  defaultValues: { role: 'user' },
  fieldTransformers: {
    email: (val) => val.trim().toLowerCase(),
  },
});

const { result } = normalizer.normalize({
  email: '  JOHN@EXAMPLE.COM  ',
});
```

---

### 🔹 Express Middleware

```ts
import express from 'express';
import { createNormalizerMiddleware } from '@cleaner/core';

const app = express();

app.use(express.json());

app.post(
  '/submit',
  createNormalizerMiddleware({
    source: 'body', // 'query' | 'params' | 'body'
    options: {
      validators: {
        password: (val) => val.length >= 8,
      },
    },
  }),
  (req, res) => {
    res.send(req.normalized); // normalized version of req.body
  }
);
```

---

## ⚙️ Available Options

| Option | Type | Description |
|--------|------|-------------|
| `convertBooleans` | `boolean` | Convert `"true"` / `"false"` |
| `convertNumbers` | `boolean` | Convert `"123"` to `123` |
| `convertNulls` | `boolean` | Convert `"null"` / `"undefined"` |
| `enableDateParsing` | `boolean` | Parse ISO and short dates |
| `enableJsonParsing` | `boolean` | Convert JSON strings to objects/arrays |
| `treatEmptyStringAs` | `"null" \| "undefined" \| "keep"` | How to handle empty strings |
| `removeUndefinedFields` | `boolean` | If `true`, removes `undefined` keys |
| `fieldTransformers` | `{ [key]: (val) => any }` | Field-specific mutation |
| `fieldParsers` | `{ type: (val) => any }` | Per-type custom parser (string, number, date...) |
| `validators` | `{ [key]: (val) => boolean }` | Field validation logic |
| `validationMode` | `"none" \| "strict" \| "collect"` | Controls error behavior |
| `defaultValues` | `{ [key]: any }` | Inject default values if missing/null |
| `schemaFallbacks` | `{ [key]: (val) => any }` | Post-parse fix function |

---

## 🧪 TypeScript Support

All APIs are fully typed.

```ts
normalize<MyDTO>(input, options): NormalizerResult<MyDTO>;
```

---

## 🧩 Use Cases

- Clean up query params, form inputs, or API payloads
- Prepare inputs for validation or DB insertion
- Add defaults, sanitize values, and reject invalid data
- Normalize external integrations or CLI args

---

## 📁 Directory Structure

```
src/
├── InputNormalizer.ts       # Main class-based engine
├── normalize.ts             # Functional API
├── utils.ts                 # Helpers
├── types.ts                 # Core interfaces
```

---

## 📄 License

MIT © 2024 Patrick NAYITURIKI  
Pull requests are welcome!

---

## 🤝 Contribution

```bash
# Fork & clone
git clone https://github.com/yourname/cleaner-core

# Install dependencies
npm install

# Run tests
npm test
```

Feel free to submit bug reports, PRs, or feature ideas via [Issues](https://github.com/yourname/cleaner-core/issues).