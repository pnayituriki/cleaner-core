import { z } from "zod";
import * as yup from "yup";
import { InputNormalizer } from "../src";

const customMessages = {
  "email.invalid": "Validation failed for email",
  "username.invalid": "Username is too short",
  "username.schema": "String must contain at least 3 characters",
  "email.schema": "must be a valid email",
  "role.schema": "Must be admin",
};

describe("Validation and fallback behavior", () => {
  it("should throw immediately in strict mode", () => {
    const normalizer = new InputNormalizer({
      validationMode: "strict",
      validators: {
        email: (val) => val.includes("@"),
      },
      messages: customMessages,
    });

    expect(() => {
      normalizer.normalize({ email: "invalid-email" });
    }).toThrow("Validation failed for email");
  });
});

describe("Schema validation behavior", () => {
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
      messages: {
        "username.schema": "String must contain at least 3 characters",
      },
    });

    const { errors } = normalizer.normalize({ username: "ab" });

    expect(errors?.username).toContain(
      "String must contain at least 3 characters"
    );
  });

  it("should support yup schema validation", () => {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
    });

    const normalizer = new InputNormalizer({
      schema: { type: "yup", validator: schema },
      validationMode: "collect",
      messages: {
        "email.schema": "must be a valid email",
      },
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
      messages: {
        "role.schema": "Must be admin",
      },
    });

    const { errors } = normalizer.normalize({ role: "guest" });

    expect(errors?.role).toBe("Must be admin");
  });
});

