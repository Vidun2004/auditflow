import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Register your organization
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a workspace for your team. Your account will be reviewed before
          activation.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-gray-900 underline underline-offset-4"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
