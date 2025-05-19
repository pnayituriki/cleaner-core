import { z } from "zod";
import * as yup from "yup";

import {
  createPasswordValidator,
  InputNormalizer,
  NormalizerOptions,
} from "../src";

describe("InputNormalizer - normalize()", () => {
  const normalizer = new InputNormalizer();

  it("should normalize nested objects and values", () => {
    const input = {
      active: "true",
      score: "99",
      profile: {
        dob: "2024-01-01T00:00:00Z",
        issuedAt: "2024-01-01",
        location: "Kigali",
      },
      preferences: '["dark", "compact"]',
    };

    const { result } = normalizer.normalize(input);

    expect(result.active).toBe(true);
    expect(result.score).toBe(99);
    expect(result.profile.dob instanceof Date).toBe(true);
    expect(result.profile.issuedAt instanceof Date).toBe(true);
    expect(result.profile.location).toEqual("Kigali");
    expect(result.preferences).toEqual(["dark", "compact"]);
  });

  it("should apply whitelist and transformers", () => {
    const normalizer = new InputNormalizer({
      whitelist: ["email"],
      fieldTransformers: {
        email: (val) => val.toLowerCase(),
      },
    });

    const { result } = normalizer.normalize({
      email: "Test@Email.com",
      other: "skip me",
    });

    expect(result).toEqual({ email: "test@email.com" });
  });

  it("should apply default values and schema fallback", () => {
    const normalizer = new InputNormalizer({
      defaultValues: { country: "RW" },
      schemaFallbacks: {
        age: (val) => (val > 150 ? 0 : val),
      },
    });

    const { result } = normalizer.normalize({
      age: 200,
      country: null,
    });

    expect(result.age).toBe(0);
    expect(result.country).toBe("RW");
  });

  it("should collect validation errors", () => {
    const normalizer = new InputNormalizer({
      validationMode: "collect",
      validators: {
        username: (val) => typeof val === "string" && val.length >= 3,
        password: createPasswordValidator({
          minLength: 10,
          requireUppercase: true,
          requireNumber: true,
          requireSymbol: true,
        }),
      },
    });

    const { result, errors } = normalizer.normalize({
      username: "ab",
      password: "abc123",
      role: "admin",
    });

    expect(result.username).toBe("ab");
    expect(errors?.username).toBeDefined();
    expect(errors?.password).toBeDefined();
    expect(Object.keys(errors || {})).toEqual(
      expect.arrayContaining(["username", "password"])
    );
  });

  it("should pass when password meets complexity rules", () => {
    const normalizer = new InputNormalizer({
      validationMode: "collect",
      validators: {
        password: (val) =>
          typeof val === "string" &&
          val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^a-zA-Z0-9]/.test(val),
      },
    });

    const { errors } = normalizer.normalize({
      password: "Str0ng@Pass",
    });

    expect(errors).toBeUndefined();
  });
});

describe("Core normalization cases", () => {
  const options: NormalizerOptions = {
    enableDateParsing: true,
    enableJsonParsing: true,
    convertBooleans: true,
    convertNumbers: true,
    convertNulls: true,
    treatEmptyStringAs: "null",
  };

  const normalizer = new InputNormalizer(options);

  it("should convert basic types correctly", () => {
    const { result } = normalizer.normalize({
      active: "true",
      count: "42",
      empty: "",
      nullable: "null",
      undef: "undefined",
      stringified: "plain text",
    });

    expect(result).toEqual({
      active: true,
      count: 42,
      empty: null,
      nullable: null,
      undef: undefined,
      stringified: "plain text",
    });
  });

  it("should parse JSON strings", () => {
    const { result } = normalizer.normalize({
      tags: '["alpha", "beta"]',
      settings: '{"theme":"dark"}',
    });

    expect(result.tags).toEqual(["alpha", "beta"]);
    expect(result.settings).toEqual({ theme: "dark" });
  });

  it("should convert ISO and short date strings", () => {
    const { result } = normalizer.normalize({
      createdAt: "2024-01-01T00:00:00Z",
      birthDate: "2024-01-01",
    });

    expect(result.createdAt instanceof Date).toBe(true);
    expect(result.birthDate instanceof Date).toBe(true);
  });

  it("should support arrays of primitives and objects", () => {
    const { result } = normalizer.normalize({
      scores: ["1", "2", "3"],
      people: [
        { name: "Alice", age: "30" },
        { name: "Bob", age: "40" },
      ],
    });

    expect(result.scores).toEqual([1, 2, 3]);
    expect(result.people[0].age).toBe(30);
  });

  it("should apply fieldParsers and fieldTransformers", () => {
    const normalizer = new InputNormalizer({
      fieldParsers: {
        number: (n) => n * 2,
      },
      fieldTransformers: {
        username: (val) => val.trim().toLowerCase(),
      },
    });

    const { result } = normalizer.normalize({
      age: "10",
      username: " JohnDoe ",
    });

    expect(result.age).toBe(20);
    expect(result.username).toBe("johndoe");
  });

  it("should apply whitelist and blacklist correctly", () => {
    const normalizer = new InputNormalizer({
      whitelist: ["a", "b"],
      blacklist: ["b"],
    });

    const { result } = normalizer.normalize({
      a: "hello",
      b: "block me",
      c: "skip me",
    });

    expect(result).toEqual({ a: "hello" });
  });

  it("should remove undefined fields", () => {
    const normalizer = new InputNormalizer({
      removeUndefinedFields: true,
      treatEmptyStringAs: "undefined",
    });

    const { result } = normalizer.normalize({
      name: "john",
      empty: "",
      blank: "   ",
      email: "john@example.com",
    });

    expect(result).toEqual({
      name: "john",
      email: "john@example.com",
    });
    expect(result.empty).toBeUndefined();
  });
});

describe("Validation and fallback behavior", () => {
  it("should apply defaultValues if null or undefined", () => {
    const normalizer = new InputNormalizer({
      defaultValues: {
        country: "RW",
        status: "active",
      },
    });

    const { result } = normalizer.normalize({
      country: null,
      status: undefined,
    });

    expect(result).toEqual({
      country: "RW",
      status: "active",
    });
  });

  it("should apply schema fallback if value is invalid", () => {
    const normalizer = new InputNormalizer({
      schemaFallbacks: {
        age: (val) => (val > 150 ? 0 : val),
      },
    });

    const { result } = normalizer.normalize({ age: 999 });

    expect(result.age).toBe(0);
  });

  it("should collect validation errors", () => {
    const normalizer = new InputNormalizer({
      validationMode: "collect",
      validators: {
        username: (val) => typeof val === "string" && val.length >= 3,
        password: (val) =>
          typeof val === "string" &&
          val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^a-zA-Z0-9]/.test(val),
      },
    });

    const { errors } = normalizer.normalize({
      username: "ab",
      password: "weak123",
    });

    expect(errors).toBeDefined();
    expect(errors?.username).toBeDefined();
    expect(errors?.password).toBeDefined();
  });

  it("should throw immediately in strict mode", () => {
    const normalizer = new InputNormalizer({
      validationMode: "strict",
      validators: {
        email: (val) => val.includes("@"),
      },
    });

    expect(() => {
      normalizer.normalize({ email: "invalid-email" });
    }).toThrow('Validation failed for field "email"');
  });
});

describe("Schema validation behavior", () => {
  it("should throw error if zod schema fails and mode is strict", () => {
    const schema = z.object({
      username: z.string().min(3),
    });

    const normalizer = new InputNormalizer({
      schema: {
        type: "zod",
        validator: schema,
      },
      validationMode: "strict",
    });

    expect(() => normalizer.normalize({ username: "ab" })).toThrow(
      /Schema validation failed/
    );
  });

  it("should collect schema errors if mode is collect", () => {
    const schema = z.object({
      username: z.string().min(3),
    });

    const normalizer = new InputNormalizer({
      schema: {
        type: "zod",
        validator: schema,
      },
      validationMode: "collect",
    });

    const { errors } = normalizer.normalize({ username: "ab" });

    expect(errors?.username).toContain(
      "String must contain at least 3 character"
    );
  });

  it("should fallback invalid schema fields if fallback defined", () => {
    const schema = z.object({
      age: z.number().min(18),
    });

    const normalizer = new InputNormalizer({
      schema: {
        type: "zod",
        validator: schema,
      },
      validationMode: "collect",
      schemaFallbacks: {
        age: () => 18, // fallback if age < 18
      },
    });

    const { result, errors } = normalizer.normalize({ age: 10 });

    // ✅ The fallback was applied
    expect(result.age).toBe(18);

    // ✅ And the error is no longer reported
    expect(errors?.age).toBeUndefined();
  });

  it("should support yup schema validation", () => {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
    });

    const normalizer = new InputNormalizer({
      schema: { type: "yup", validator: schema },
      validationMode: "collect",
    });

    const { errors } = normalizer.normalize({ email: "not-an-email" });

    expect(errors?.email).toContain("must be a valid email");
  });

  it("should support custom schema validator", () => {
    const customValidator = {
      validate: (input: any) => {
        const errors: Record<string, string> = {};
        if (!input.role || input.role !== "admin") {
          errors.role = "Must be admin";
        }
        return {
          valid: Object.keys(errors).length === 0,
          errors,
        };
      },
    };

    const normalizer = new InputNormalizer({
      schema: {
        type: "custom",
        validator: customValidator,
      },
      validationMode: "collect",
    });

    const { errors } = normalizer.normalize({ role: "guest" });

    expect(errors?.role).toBe("Must be admin");
  });
});
