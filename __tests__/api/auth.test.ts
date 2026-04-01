import { hash, compare } from "bcryptjs";

describe("Auth utilities", () => {
  test("password hashing and comparison works", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare(password, hashed);
    expect(isValid).toBe(true);
  });

  test("wrong password fails comparison", async () => {
    const password = "testpassword123";
    const hashed = await hash(password, 12);
    const isValid = await compare("wrongpassword", hashed);
    expect(isValid).toBe(false);
  });
});
