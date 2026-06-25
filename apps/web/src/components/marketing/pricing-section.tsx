const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For small teams getting started with audit management.",
    highlight: false,
    cta: "Start for free",
    href: "/register",
    features: [
      "Up to 3 users",
      "5 active audits",
      "Basic findings tracking",
      "100MB evidence storage",
      "Email notifications",
      "ISO 27001 framework",
    ],
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month per org",
    description: "For growing compliance teams that need more power.",
    highlight: true,
    cta: "Start free trial",
    href: "/register",
    features: [
      "Up to 25 users",
      "Unlimited audits",
      "All finding & action workflows",
      "5GB evidence storage",
      "All 4 compliance frameworks",
      "PDF & Excel reports",
      "Risk management module",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with advanced compliance needs.",
    highlight: false,
    cta: "Contact us",
    href: "mailto:sales@auditflow.com",
    features: [
      "Unlimited users",
      "Unlimited audits & storage",
      "Custom compliance frameworks",
      "SSO / SAML integration",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment option",
      "Custom audit workflows",
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 px-6 bg-gray-50 border-y border-gray-200"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-gray-500">
            No per-user fees on lower tiers. No surprise overages.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 space-y-5 ${
                plan.highlight
                  ? "bg-gray-900 text-white border border-gray-900"
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-6 right-6 h-0.5 bg-white" />
              )}

              <div>
                <p
                  className={`text-xs font-medium uppercase tracking-widest mb-1 ${
                    plan.highlight ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-semibold ${
                      plan.highlight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-xs ${
                        plan.highlight ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlight ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <a
                href={plan.href}
                className={`block text-center py-2.5 text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.highlight ? "text-gray-400" : "text-gray-400"
                      }`}
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
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
