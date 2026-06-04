import request from "supertest";
import app from "../../server";
import { prisma } from "../../prisma/client";

describe("Products API", () => {
  let testProductId: string;

  afterAll(async () => {
    if (testProductId) {
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    await prisma.$disconnect();
  });

  it("GET /api/products should return products list", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });

  it("GET /api/products supports pagination", async () => {
    const response = await request(app).get("/api/products?page=1&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.data.products.length).toBeLessThanOrEqual(5);
    expect(response.body.data.meta).toHaveProperty("total");
    expect(response.body.data.meta).toHaveProperty("page");
    expect(response.body.data.meta).toHaveProperty("totalPages");
  });

  it("GET /api/products/:id should return a product", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Integration Test Product",
        description: "A product created for integration testing",
        price: 49.99,
        image_url: "https://example.com/test.jpg",
        category: "Test",
        stock: 5,
      },
    });
    testProductId = product.id;

    const response = await request(app).get(`/api/products/${product.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.product.name).toBe("Integration Test Product");
    expect(response.body.data.product.id).toBe(product.id);
  });

  it("GET /api/products/:id should return 404 for non-existent product", async () => {
    const response = await request(app).get(
      "/api/products/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
