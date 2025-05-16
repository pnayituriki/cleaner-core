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
