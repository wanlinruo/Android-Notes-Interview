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

describe("Registration validation", () => {
  function validateRegistration(data: {
    email?: string;
    password?: string;
    nickname?: string;
  }) {
    const errors: string[] = [];
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email");
    }
    if (!data.password || data.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (!data.nickname || data.nickname.trim().length === 0) {
      errors.push("Nickname is required");
    }
    return errors;
  }

  test("valid registration data passes", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "password123",
      nickname: "TestUser",
    });
    expect(errors).toHaveLength(0);
  });

  test("invalid email fails", () => {
    const errors = validateRegistration({
      email: "not-an-email",
      password: "password123",
      nickname: "TestUser",
    });
    expect(errors).toContain("Invalid email");
  });

  test("short password fails", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "12345",
      nickname: "TestUser",
    });
    expect(errors).toContain("Password must be at least 6 characters");
  });

  test("empty nickname fails", () => {
    const errors = validateRegistration({
      email: "test@example.com",
      password: "password123",
      nickname: "",
    });
    expect(errors).toContain("Nickname is required");
  });
});
