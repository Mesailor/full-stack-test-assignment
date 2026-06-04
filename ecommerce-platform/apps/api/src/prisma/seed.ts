import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password_hash: hashedPassword,
      first_name: "Test",
      last_name: "User",
    },
  });
  console.log("Created test user:", user.email);

  // Create sample products
  const products = [
    {
      name: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      category: "Electronics",
      stock: 50,
    },
    {
      name: "Smart Watch",
      description: "Fitness tracking and notifications on your wrist",
      price: 299.99,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      category: "Electronics",
      stock: 30,
    },
    {
      name: "Laptop Backpack",
      description: "Durable backpack with laptop compartment",
      price: 79.99,
      image_url:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      category: "Accessories",
      stock: 100,
    },
    {
      name: "Coffee Maker",
      description: "Programmable coffee maker with thermal carafe",
      price: 89.99,
      image_url:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
      category: "Home",
      stock: 25,
    },
    {
      name: "Running Shoes",
      description: "Comfortable running shoes with advanced cushioning",
      price: 129.99,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      category: "Sports",
      stock: 75,
    },
    {
      name: "Yoga Mat",
      description: "Non-slip yoga mat with carrying strap",
      price: 39.99,
      image_url:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
      category: "Sports",
      stock: 150,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
