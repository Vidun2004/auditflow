import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Login" };

interface Props {
  searchParams: Promise<{ invited?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      {params.invited === "1" && (
        <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Account created successfully. Sign in to access your workspace.
        </div>
      )}
      {params.error === "auth_callback_failed" && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Authentication failed. Please try again.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Sign in to AuditFlow
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your credentials to access your workspace.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have a workspace?{" "}
        <a
          href="/register"
          className="font-medium text-gray-900 underline underline-offset-4"
        >
          Register your organization
        </a>
      </p>
    </div>
  );
}
