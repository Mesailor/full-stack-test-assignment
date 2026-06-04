import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button, Input } from "@repo/ui";
import { useAuthStore } from "../../stores/auth.store";
import { useUIStore } from "../../stores/ui.store";
import { userService } from "../../services/user.service";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
}

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const addNotification = useUIStore((state) => state.addNotification);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      setIsEditing(false);
      addNotification({
        type: "success",
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      addNotification({
        type: "error",
        message: error.response?.data?.error?.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface p-6 rounded-md shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register("first_name", { required: "First name is required" })}
            error={errors.first_name?.message}
            disabled={!isEditing}
          />

          <Input
            label="Last Name"
            {...register("last_name", { required: "Last name is required" })}
            error={errors.last_name?.message}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
          disabled={!isEditing}
        />

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Account ID</p>
          <p className="font-mono text-sm">{user?.id}</p>
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </motion.div>
  );
};
