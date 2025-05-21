import { InputNormalizer } from "../src";
import { LoggerPlugin } from "../src/plugins/LoggerPlugin";
import { createAuditTrailPlugin } from "../src/plugins/AuditTrailPlugin";
import { SanitizerPlugin } from "../src/plugins/SanitizerPlugin";

describe("Plugin System", () => {
  it("should log all normalization steps with LoggerPlugin", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const normalizer = new InputNormalizer({
      plugins: [LoggerPlugin],
      validators: {
        name: (val) => typeof val === "string" && val.length > 1,
      },
      validationMode: "collect",
    });

    normalizer.normalize({ name: "a" });
    expect(consoleSpy.mock.calls.flat().join(" ")).toContain(
      "Normalizing field"
    );
    expect(warnSpy.mock.calls.flat().join(" ")).toContain("Validation failed");


    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("should track changes using AuditTrailPlugin", () => {
    const auditLog: any[] = [];

    const normalizer = new InputNormalizer({
      plugins: [createAuditTrailPlugin(auditLog)],
      fieldTransformers: {
        email: (v) => v.toLowerCase(),
      },
    });

    normalizer.normalize({ email: "UPPERCASE@EMAIL.COM" });

    expect(auditLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "email", from: "UPPERCASE@EMAIL.COM", to: "uppercase@email.com" }),
      ])
    );
  });

  it("should sanitize fields using SanitizerPlugin", () => {
    const normalizer = new InputNormalizer({
      plugins: [SanitizerPlugin],
    });

    const { result } = normalizer.normalize({
      name: "  John  ",
      email: " ADMIN@DOMAIN.COM ",
    });

    expect(result.name).toBe("John");
    expect(result.email).toBe("admin@domain.com");

  });
});