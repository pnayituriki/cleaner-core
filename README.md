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
npm install @cleaner/core zod yup
```

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
    source: 'body',
    options: {
      validators: {
        password: (val) => val.length >= 8,
      },
      validationMode: 'collect',
    },
  }),
  (req, res) => {
    if (req.normalized?.errors) {
      return res.status(400).json({ errors: req.normalized.errors });
    }
    res.send(req.normalized.result);
  }
);
```

---

## 🧪 Schema Validation Support

### ✅ Zod

```ts
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3),
  age: z.number().min(18),
});

const { result, errors } = normalize(input, {
  schema: {
    type: 'zod',
    validator: schema,
  },
  validationMode: 'collect',
});
```

---

### ✅ Yup

```ts
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email().required(),
});

const { result, errors } = normalize(input, {
  schema: {
    type: 'yup',
    validator: schema,
  },
  validationMode: 'collect',
});
```

---

### ✅ Custom Schema

```ts
const customSchema = {
  validate: (input) => {
    const errors = {};
    if (input.role !== 'admin') errors.role = 'Must be admin';
    return { valid: Object.keys(errors).length === 0, errors };
  },
};

const { result, errors } = normalize(input, {
  schema: {
    type: 'custom',
    validator: customSchema,
  },
  validationMode: 'collect',
});
```

---

## ⚙️ Options

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
| `fieldParsers` | `{ type: (val) => any }` | Per-type custom parser |
| `validators` | `{ [key]: (val) => boolean }` | Field validation logic |
| `defaultValues` | `{ [key]: any }` | Fallback values if null/undefined |
| `schemaFallbacks` | `{ [key]: (val) => any }` | Apply fallback if schema fails |
| `validationMode` | `"none" \| "strict" \| "collect"` | Error behavior |
| `schema` | `zod \| yup \| custom` | Schema-level validator |

---

## 📁 Directory Structure

```
src/
├── InputNormalizer.ts       # Main class-based engine
├── normalize.ts             # Functional API
├── utils.ts                 # Helpers
├── types.ts                 # Interfaces and types
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