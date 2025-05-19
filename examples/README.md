# @cleaner/core – Usage Examples

Explore how to use the library in real projects across different environments.

---

## 🔹 1. Express API (Body / Query)

```ts
import express from 'express';
import { createNormalizerMiddleware } from '@cleaner/core';

const app = express();
app.use(express.json());

app.post(
  '/register',
  createNormalizerMiddleware({
    source: 'body',
    options: {
      convertBooleans: true,
      validators: {
        email: (val) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val),
        termsAccepted: (val) => val === true,
      },
      validationMode: 'collect',
    },
  }),
  (req, res) => {
    if (req.normalized?.errors) {
      return res.status(400).json({ errors: req.normalized.errors });
    }
    res.status(200).json({ data: req.normalized.result });
  }
);
