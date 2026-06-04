import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "@repo/ui";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import type { RegisterRequest } from "@repo/types";

export const Register = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface p-8 rounded-md shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">Register</h1>

          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="First Name"
              {...register("first_name", {
                required: "First name is required",
              })}
              error={errors.first_name?.message}
            />

            <Input
              label="Last Name"
              {...register("last_name", { required: "Last name is required" })}
              error={errors.last_name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              error={errors.password?.message}
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Register
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
