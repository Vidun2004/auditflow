"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteAcceptSchema, type InviteAcceptInput } from "@/lib/validations";
import { acceptInviteAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/loading";

interface Props {
  token: string;
  email: string;
  orgName: string;
}

export function InviteAcceptForm({ token, email }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteAcceptInput>({
    resolver: zodResolver(inviteAcceptSchema),
  });

  async function onSubmit(data: InviteAcceptInput) {
    setServerError(null);
    const result = await acceptInviteAction(token, data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push("/login?invited=1");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <Label>Email address</Label>
        <Input
          type="email"
          value={email}
          disabled
          className="bg-gray-50 text-gray-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Your full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          {...register("name")}
          className={errors.name ? "border-red-300" : ""}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
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
          placeholder="Repeat your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={errors.confirmPassword ? "border-red-300" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-900 text-white hover:bg-gray-800"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="border-white border-t-gray-400" />
            Creating account...
          </span>
        ) : (
          "Create account & join"
        )}
      </Button>
    </form>
  );
}
