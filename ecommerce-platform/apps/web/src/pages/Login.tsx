import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "@repo/ui";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import type { LoginRequest } from "@repo/types";

export const Login = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface p-8 rounded-md shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password", { required: "Password is required" })}
              error={errors.password?.message}
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Login
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
