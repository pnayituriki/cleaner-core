import {
  createEmailValidator,
  createPasswordValidator,
  createPhoneValidator,
  createUsernameValidator,
  NormalizerOptions,
  parseValue,
} from "../src";

const defaultOptions: NormalizerOptions = {
  treatEmptyStringAs: "null",
  removeUndefinedFields: false,
  enableDateParsing: true,
  enableJsonParsing: true,
  convertNumbers: true,
  convertBooleans: true,
  convertNulls: true,
  whitelist: null,
  blacklist: null,
  fieldTransformers: {},
  fieldParsers: {},
  defaultValues: {},
  schemaFallbacks: {},
  validators: {},
  validationMode: "none",
};

describe("parseValue()", () => {
  it('should convert "true" and "false" to boolean', () => {
    expect(parseValue("true", null, defaultOptions)).toBe(true);
    expect(parseValue("false", null, defaultOptions)).toBe(false);
  });

  it("should convert numeric strings to numbers", () => {
    expect(parseValue("42", null, defaultOptions)).toBe(42);
  });

  it('should convert "null" and "undefined"', () => {
    expect(parseValue("null", null, defaultOptions)).toBeNull();
    expect(parseValue("undefined", null, defaultOptions)).toBeUndefined();
  });

  it("should detect ISO date strings", () => {
    const val = parseValue("2024-01-01T00:00:00Z", null, defaultOptions);
    expect(val instanceof Date).toBe(true);
  });

  it("should parse JSON arrays and objects", () => {
    expect(parseValue('["a","b"]', null, defaultOptions)).toEqual(["a", "b"]);
    expect(parseValue('{"x":1}', null, defaultOptions)).toEqual({ x: 1 });
  });

  it("should respect treatEmptyStringAs option", () => {
    expect(
      parseValue("", null, { ...defaultOptions, treatEmptyStringAs: "keep" })
    ).toBe("");
    expect(
      parseValue("", null, { ...defaultOptions, treatEmptyStringAs: "null" })
    ).toBeNull();
    expect(
      parseValue("", null, {
        ...defaultOptions,
        treatEmptyStringAs: "undefined",
      })
    ).toBeUndefined();
  });
});

describe("createPasswordValidator", () => {
  const validator = createPasswordValidator();

  it("fails short passwords", () => {
    expect(validator("abc")).toBe(false);
  });

  it("fails password without uppercase, number, and symbol", () => {
    expect(validator("lowercaseonly")).toBe(false);
  });

  it("passes a strong password", () => {
    expect(validator("Strong1!")).toBe(true);
  });

  it("respects custom minimum length", () => {
    const strictValidator = createPasswordValidator({ minLength: 12 });
    expect(strictValidator("Strong1!")).toBe(false);
    expect(strictValidator("Stronger123!")).toBe(true);
  });

  it("can disable some rules", () => {
    const relaxed = createPasswordValidator({ requireSymbol: false });
    expect(relaxed("Strong123")).toBe(true);
  });
});

describe("createEmailValidator", () => {
  const validator = createEmailValidator();
  it("accepts valid email", () => {
    expect(validator("test@example.com")).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(validator("test.com")).toBe(false);
  });
});

describe("createUsernameValidator", () => {
  it("accepts valid usernames", () => {
    const validator = createUsernameValidator();
    expect(validator("john_doe")).toBe(true);
  });

  it("rejects invalid characters", () => {
    const validator = createUsernameValidator();
    expect(validator("john.doe!")).toBe(false);
  });

  it("respects digit/underscore rules", () => {
    const validator = createUsernameValidator({ allowDigits: false });
    expect(validator("john123")).toBe(false);
  });
});

describe("createPhoneValidator", () => {
  const validator = createPhoneValidator();

  it("accepts +250786123456", () => {
    expect(validator("+250786123456")).toBe(true);
  });

  it("rejects short number", () => {
    expect(validator("123")).toBe(false);
  });

  it("validates without + prefix if not allowed", () => {
    const noPlus = createPhoneValidator({ allowPlusPrefix: false });
    expect(noPlus("+250786123456")).toBe(false);
    expect(noPlus("250786123456")).toBe(true);
  });
});
