import { prisma } from "../prisma/client";
import { ProductFilterInput } from "@repo/utils";
import { Prisma } from "@prisma/client";

export class ProductService {
  async getProducts(filters: ProductFilterInput) {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && {
        price: { lte: maxPrice, ...(minPrice && { gte: minPrice }) },
      }),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { created_at: "desc" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...product,
      price: Number(product.price),
    };
  }

  async getCategories() {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }
}

export const productService = new ProductService();
