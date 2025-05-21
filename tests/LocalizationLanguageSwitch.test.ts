import { InputNormalizer } from "../src";

describe("Localization - setLanguage() behavior", () => {
  const messages = {
    en: {
      "email.invalid": "Invalid email address",
    },
    fr: {
      "email.invalid": "Invalid email address",
    },
  };

  it("should use default language for messages", () => {
    const normalizer = new InputNormalizer({
      language: "en",
      messages,
      validationMode: "collect",
      validators: {
        email: (val) => val.includes("@"),
      },
    });

    const { errors } = normalizer.normalize({ email: "bad" });
    expect(errors?.email).toBe("Invalid email address");
  });

  it("should switch to a different language using setLanguage()", () => {
    const normalizer = new InputNormalizer({
      language: "en",
      messages,
      validationMode: "collect",
      validators: {
        email: (val) => val.includes("@"),
      },
    });

    normalizer.setLanguage("fr");

    const { errors } = normalizer.normalize({ email: "bad" });
    expect(errors?.email).toBe("Invalid email address");
  });
});