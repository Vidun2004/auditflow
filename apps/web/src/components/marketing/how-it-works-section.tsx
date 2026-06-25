const steps = [
  {
    number: "01",
    title: "Register your organization",
    description:
      "Sign up with your work email and organization name. Our team reviews and approves your workspace within 24 hours.",
  },
  {
    number: "02",
    title: "Set up your workspace",
    description:
      "Configure your compliance frameworks, invite your team, set roles, and customize your org branding and preferences.",
  },
  {
    number: "03",
    title: "Create your first audit",
    description:
      "Define scope, assign auditors, set dates, and launch. AuditFlow tracks every step with a full timeline.",
  },
  {
    number: "04",
    title: "Track findings & actions",
    description:
      "Log findings with severity, assign corrective actions with deadlines, upload evidence, and monitor resolution.",
  },
  {
    number: "05",
    title: "Map to compliance frameworks",
    description:
      "Link findings to ISO 27001, SOC 2, ISO 9001, or GDPR controls. AuditFlow calculates your compliance score automatically.",
  },
  {
    number: "06",
    title: "Report to leadership",
    description:
      "Generate executive reports, compliance summaries, and risk dashboards — export as PDF or Excel in one click.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-6 bg-gray-50 border-y border-gray-200"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 max-w-xl">
            From setup to your first audit report in minutes.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-3 left-full w-8 h-px bg-gray-200 z-10" />
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-gray-200 tabular-nums">
                    {step.number}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
