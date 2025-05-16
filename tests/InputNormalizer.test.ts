import { createPasswordValidator, InputNormalizer } from "../src";

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
