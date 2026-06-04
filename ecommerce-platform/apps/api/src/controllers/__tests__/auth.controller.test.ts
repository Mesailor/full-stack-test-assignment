import request from "supertest";
import app from "../../server";
import { prisma } from "../../prisma/client";

describe("Auth Controller", () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: "test" } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test-register@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe("test-register@example.com");
    });

    it("should return error for duplicate email", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        email: "test-duplicate@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      // Duplicate registration
      const response = await request(app).post("/api/auth/register").send({
        email: "test-duplicate@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "weak",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      // Create test user
      await request(app).post("/api/auth/register").send({
        email: "test-login@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should return error for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "Password123",
      });
      accessToken = response.body.data.accessToken;
    });

    it("should return current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("test-login@example.com");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
