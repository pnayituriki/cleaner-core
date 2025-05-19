import { normalize } from "../src";

describe("Functional API - normalize()", () => {
  it("should normalize simple query object", () => {
    const { result } = normalize({
      active: "true",
      age: "25",
    });

    expect(result).toEqual({
      active: true,
      age: 25,
    });
  });
});
