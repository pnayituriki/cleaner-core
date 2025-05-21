# 🧪 Schema Validation Guide

`@cleaner/core` supports field-level schema validation via:

- [Zod](https://github.com/colinhacks/zod)
- [Yup](https://github.com/jquense/yup)
- Custom validation objects

## ✅ Zod Example

```ts
import { z } from 'zod';

const normalizer = new InputNormalizer({
  schema: {
    type: 'zod',
    validator: z.object({
      username: z.string().min(3),
      email: z.string().email(),
    }),
  },
  validationMode: 'collect'
});
```

## ✅ Yup Example

```ts
import * as yup from 'yup';

const normalizer = new InputNormalizer({
  schema: {
    type: 'yup',
    validator: yup.object({
      email: yup.string().email().required(),
    }),
  },
  validationMode: 'collect'
});
```

## ✅ Custom Schema

```ts
const validator = {
  validate: (data) => {
    const errors = {};
    if (!data.role || data.role !== 'admin') {
      errors.role = "Must be admin";
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }
};

const normalizer = new InputNormalizer({
  schema: {
    type: 'custom',
    validator
  },
  validationMode: 'collect'
});
```

## 🧩 Fallbacks

Use `schemaFallbacks` to patch invalid fields:

```ts
schemaFallbacks: {
  age: () => 18
}
```
