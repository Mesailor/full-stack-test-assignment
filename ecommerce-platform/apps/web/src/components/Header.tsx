import { useNavigate, NavLink } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { useUIStore } from "../stores/ui.store";
import { useAuthStore } from "../stores/auth.store";

export const Header = () => {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { toggleCart } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-secondary text-surface sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="text-primary font-bold text-xl tracking-tight"
        >
          eCOM
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-primary" : "text-gray-300 hover:text-surface"
              }`
            }
          >
            Products
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden md:block text-sm text-gray-400">
              {user.first_name} {user.last_name}
            </span>
          )}

          {/* Cart button with badge */}
          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-300 hover:text-surface transition-colors"
            aria-label="Open cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-secondary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-surface transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
