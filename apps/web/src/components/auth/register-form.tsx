"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/loading";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const result = await registerAction(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push("/pending");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="orgName">Organization name</Label>
        <Input
          id="orgName"
          type="text"
          placeholder="Acme Corporation"
          {...register("orgName")}
          className={errors.orgName ? "border-red-300" : ""}
        />
        {errors.orgName && (
          <p className="text-xs text-red-600">{errors.orgName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          className={errors.email ? "border-red-300" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          {...register("password")}
          className={errors.password ? "border-red-300" : ""}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          {...register("confirmPassword")}
          className={errors.confirmPassword ? "border-red-300" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
        Your organization will be reviewed by our team before activation.
        You&apos;ll receive an email once approved.
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white hover:bg-gray-800"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="border-white border-t-gray-400" />
            Creating workspace...
          </span>
        ) : (
          "Register organization"
        )}
      </Button>
    </form>
  );
}
