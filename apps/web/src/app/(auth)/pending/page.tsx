import { Metadata } from "next";

export const metadata: Metadata = { title: "Awaiting Approval" };

export default function PendingPage() {
  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-gray-900">
        <svg
          className="h-6 w-6 text-gray-900"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Awaiting approval
        </h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Your organization registration is under review. Once approved,
          you&apos;ll receive an email with a link to set up your account and
          access your workspace.
        </p>
      </div>

      <div className="border border-gray-200 bg-gray-50 px-4 py-4 text-left space-y-2">
        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          What happens next
        </p>
        <ol className="text-sm text-gray-500 space-y-1.5 list-none">
          <li className="flex gap-2">
            <span className="font-medium text-gray-700">1.</span>
            Our team reviews your registration (usually within 24 hours)
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-gray-700">2.</span>
            You receive an approval email with your setup link
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-gray-700">3.</span>
            Click the link to activate your Admin account
          </li>
        </ol>
      </div>

      <a
        href="/login"
        className="inline-block text-sm text-gray-500 underline underline-offset-4"
      >
        Back to login
      </a>
    </div>
  );
}
