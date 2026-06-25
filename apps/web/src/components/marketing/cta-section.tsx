import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 px-6 bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Ready to bring order to your compliance process?
            </h2>
            <p className="text-gray-400">
              Register your organization today. No credit card required. Your
              workspace will be reviewed and activated within 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/register"
              className="bg-white px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors text-center"
            >
              Start free trial →
            </Link>
            <Link
              href="/login"
              className="border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white transition-colors text-center"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Stat bar */}
        <div className="mt-14 pt-10 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10,000+", label: "Audits completed" },
            { value: "500+", label: "Organizations" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "4 frameworks", label: "Built-in compliance" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
