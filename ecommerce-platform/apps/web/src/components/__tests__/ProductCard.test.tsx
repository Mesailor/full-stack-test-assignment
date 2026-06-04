import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProductCard } from "../ProductCard";
import type { Product } from "@repo/types";

const mockAddItem = vi.fn();
const mockAddNotification = vi.fn();

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, whileHover: _wh, transition: _tr, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@repo/ui", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@repo/utils", () => ({
  formatCurrency: (price: number) => `$${price.toFixed(2)}`,
}));

vi.mock("../../stores/cart.store", () => ({
  useCartStore: (selector: (state: any) => any) =>
    selector({ addItem: mockAddItem }),
}));

vi.mock("../../stores/ui.store", () => ({
  useUIStore: (selector: (state: any) => any) =>
    selector({ addNotification: mockAddNotification }),
}));

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  description: "A test product description",
  price: 99.99,
  image_url: "https://example.com/test.jpg",
  category: "Electronics",
  stock: 10,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("ProductCard", () => {
  beforeEach(() => {
    mockAddItem.mockClear();
    mockAddNotification.mockClear();
  });

  it("renders product name and price", () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders product image with alt text", () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    const img = screen.getByAltText("Test Product");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders product category", () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("shows Out of Stock overlay when stock is 0", () => {
    const outOfStock = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStock} onClick={() => {}} />);

    expect(screen.getAllByText("Out of Stock").length).toBeGreaterThan(0);
  });

  it("disables add to cart button when stock is 0", () => {
    const outOfStock = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStock} onClick={() => {}} />);

    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((b) =>
      b.textContent?.includes("Out of Stock"),
    );
    expect(addButton).toBeDisabled();
  });

  it("calls onClick when product content is clicked", () => {
    const handleClick = vi.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    fireEvent.click(screen.getByText("Test Product"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("adds item to cart when Add to Cart button is clicked", () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    const addButton = screen.getByRole("button", { name: "Add to Cart" });
    fireEvent.click(addButton);

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
  });

  it("shows notification when item is added to cart", () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    const addButton = screen.getByRole("button", { name: "Add to Cart" });
    fireEvent.click(addButton);

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        message: expect.stringContaining("Test Product"),
      }),
    );
  });

  it("does not call onClick when Add to Cart is clicked", () => {
    const handleClick = vi.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    const addButton = screen.getByRole("button", { name: "Add to Cart" });
    fireEvent.click(addButton);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
