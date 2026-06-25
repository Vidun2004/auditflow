import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-1.5">
          <span className="h-1.5 w-1.5 bg-green-500" />
          <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">
            Enterprise compliance platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 leading-tight max-w-3xl">
          Audit management that actually works at scale.
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-2xl">
          AuditFlow gives enterprise teams a single place to manage internal
          audits, track findings, resolve corrective actions, and maintain
          compliance across ISO 27001, SOC 2, ISO 9001, and GDPR — without the
          spreadsheet chaos.
        </p>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Start free trial →
          </Link>
          <Link
            href="#how-it-works"
            className="border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          {[
            "No credit card required",
            "14-day free trial",
            "Cancel anytime",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-gray-400"
            >
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              {item}
            </div>
          ))}
        </div>

        {/* Hero dashboard mockup */}
        <div className="mt-14 border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="h-2.5 w-2.5 border border-gray-300" />
            <div className="h-2.5 w-2.5 border border-gray-300" />
            <div className="h-2.5 w-2.5 border border-gray-300" />
            <div className="ml-3 flex-1 border border-gray-200 bg-white px-3 py-1">
              <span className="text-xs text-gray-400">
                app.auditflow.com/dashboard
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="flex h-80 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 border-r border-gray-100 bg-gray-50 p-4 space-y-1 shrink-0">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-900" />
                <span className="text-xs font-semibold text-gray-700">
                  AuditFlow
                </span>
              </div>
              {[
                { label: "Dashboard", active: true },
                { label: "Audits", active: false },
                { label: "Findings", active: false },
                { label: "Actions", active: false },
                { label: "Risks", active: false },
                { label: "Compliance", active: false },
                { label: "Reports", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`px-2 py-1.5 text-xs ${
                    item.active ? "bg-gray-900 text-white" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 space-y-4 overflow-hidden">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Total Audits",
                    value: "24",
                    trend: "+3 this month",
                  },
                  { label: "Open Findings", value: "17", trend: "4 critical" },
                  {
                    label: "Overdue Actions",
                    value: "5",
                    trend: "2 high priority",
                  },
                  {
                    label: "Compliance Score",
                    value: "84%",
                    trend: "+2% this week",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-gray-100 bg-white p-3"
                  >
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Mini table */}
              <div className="border border-gray-100">
                <div className="flex gap-4 border-b border-gray-100 bg-gray-50 px-3 py-2">
                  {["Audit", "Type", "Status", "Assignee", "Due"].map((h) => (
                    <span
                      key={h}
                      className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {[
                  {
                    name: "Q4 Security Audit",
                    type: "Security",
                    status: "In Progress",
                    assignee: "J. Smith",
                    due: "Dec 31",
                  },
                  {
                    name: "ISO 27001 Review",
                    type: "External",
                    status: "Scheduled",
                    assignee: "A. Patel",
                    due: "Jan 15",
                  },
                  {
                    name: "Vendor Assessment",
                    type: "Vendor",
                    status: "Draft",
                    assignee: "M. Chen",
                    due: "Jan 22",
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex gap-4 border-b border-gray-50 px-3 py-2 last:border-0"
                  >
                    <span className="flex-1 text-xs text-gray-700 truncate">
                      {row.name}
                    </span>
                    <span className="flex-1 text-xs text-gray-400">
                      {row.type}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`text-xs px-1.5 py-0.5 border ${
                          row.status === "In Progress"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : row.status === "Scheduled"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </span>
                    <span className="flex-1 text-xs text-gray-400">
                      {row.assignee}
                    </span>
                    <span className="flex-1 text-xs text-gray-400">
                      {row.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
