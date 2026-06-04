import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { Header } from "./Header";

export const AccountLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600">
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <nav className="md:col-span-1">
              <div className="bg-surface rounded-md shadow-md p-4 sticky top-4">
                <ul className="space-y-2">
                  <li>
                    <NavLink
                      to="/account"
                      end
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-sm transition-colors ${
                          isActive
                            ? "bg-primary text-secondary font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/account/profile"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-sm transition-colors ${
                          isActive
                            ? "bg-primary text-secondary font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/account/orders"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-sm transition-colors ${
                          isActive
                            ? "bg-primary text-secondary font-semibold"
                            : "hover:bg-gray-100"
                        }`
                      }
                    >
                      Order History
                    </NavLink>
                  </li>
                  <li className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Main Content */}
            <div className="md:col-span-3">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
