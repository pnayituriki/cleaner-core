# @cleaner/core — Usage Examples

---

## 🚀 Express Integration

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
        email: (val) => val.includes('@'),
      },
      validationMode: 'collect',
    },
  }),
  (req, res) => {
    if (req.normalized?.errors) {
      return res.status(400).json({ errors: req.normalized.errors });
    }
    res.json({ data: req.normalized.result });
  }
);
```

---

## ⚛️ React / Next.js Integration

```tsx
import { normalize } from '@cleaner/core';

function handleSubmit(formValues: Record<string, any>) {
  const { result, errors } = normalize(formValues, {
    convertBooleans: true,
    convertNumbers: true,
    validators: {
      age: (val) => val > 17,
    },
    validationMode: 'collect',
  });

  if (errors) {
    console.error("Validation failed:", errors);
  } else {
    console.log("Cleaned values:", result);
  }
}
```

---

## 🖥️ CLI Input Normalization

```ts
import { normalize } from '@cleaner/core';

const args = {
  debug: "true",
  port: "3000",
};

const { result } = normalize(args, {
  convertBooleans: true,
  convertNumbers: true,
});

console.log(result);
// Output: { debug: true, port: 3000 }
```

---

## ✅ Summary

- For **APIs**: use middleware (`createNormalizerMiddleware`)
- For **components/forms**: use `normalize()` function directly
- For **scripts/CLI**: clean your input args before usage