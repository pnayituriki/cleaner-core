# Multi-Language Validation Messages (Localization)

## Step 1: Define Message Sets

```ts
const messages = {
  en: {
    "email.invalid": "Invalid email address",
    "username.schema": "Username must have at least 3 characters",
  },
  fr: {
    "email.invalid": "Adresse email invalide",
    "username.schema": "Le nom d’utilisateur doit contenir au moins 3 caractères",
  },
};
```

## Step 2: Initialize the Normalizer with language and messages

```ts
const normalizer = new InputNormalizer({
  messages,
  language: "fr",
  validationMode: "collect",
});
```

## Step 3: Normalize and get localized messages

```ts
const { errors } = normalizer.normalize({ email: "bad" });
// errors.email === "Adresse email invalide"
```

## Step 4: Change language at runtime

```ts
normalizer.setLanguage("en");
const { errors: enErrors } = normalizer.normalize({ username: "ab" });
// enErrors.username === "Username must have at least 3 characters"
```