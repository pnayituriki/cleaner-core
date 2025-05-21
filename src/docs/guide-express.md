# 🚀 Express Integration Guide

Use `formulate` to validate and normalize request data in an Express server.

## ✅ Middleware Setup

```ts
import express from 'express';
import { createNormalizerMiddleware, InputNormalizer } from 'formulate';

const normalizer = new InputNormalizer({
  validators: {
    email: (val) => val.includes('@')
  },
  validationMode: 'collect'
});

const app = express();
app.use(express.json());

app.post('/register', createNormalizerMiddleware(normalizer), (req, res) => {
  if (req.normalizedErrors) {
    return res.status(400).json({ errors: req.normalizedErrors });
  }
  return res.status(200).json({ data: req.normalizedData });
});
```

## 📦 Added to `req`

- `req.normalizedData`: the normalized payload
- `req.normalizedErrors`: validation or schema errors
