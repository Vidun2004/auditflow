const frameworks = [
  {
    name: "ISO 27001",
    description:
      "Information security management system controls — map findings to Annex A controls, track certification readiness.",
    controls: "114 controls",
    category: "Information Security",
  },
  {
    name: "ISO 9001",
    description:
      "Quality management system requirements — track conformance, non-conformances, and corrective actions against ISO 9001:2015.",
    controls: "10 clauses",
    category: "Quality Management",
  },
  {
    name: "SOC 2",
    description:
      "Trust service criteria covering Security, Availability, Confidentiality, Processing Integrity, and Privacy.",
    controls: "5 criteria",
    category: "Trust & Security",
  },
  {
    name: "GDPR",
    description:
      "Map data protection obligations, track DPIAs, manage data subject requests, and monitor compliance with Articles and Recitals.",
    controls: "99 articles",
    category: "Data Privacy",
  },
];

export function FrameworksSection() {
  return (
    <section id="frameworks" className="py-20 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
            Compliance frameworks
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 max-w-xl">
            Built for the frameworks your auditors actually use.
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl">
            AuditFlow ships with pre-built control libraries for the most common
            enterprise compliance frameworks. Enable what you need, disable what
            you don&apos;t.
          </p>
        </div>

        {/* Framework cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frameworks.map((fw) => (
            <div
              key={fw.name}
              className="border border-gray-200 p-6 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {fw.name}
                  </h3>
                  <span className="text-xs text-gray-400">{fw.category}</span>
                </div>
                <span className="border border-gray-200 px-2 py-0.5 text-xs text-gray-500">
                  {fw.controls}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {fw.description}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-gray-100">
                  <div
                    className="h-1 bg-gray-900 group-hover:bg-gray-700 transition-colors"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="text-xs text-gray-400">Included</span>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="mt-6 text-sm text-gray-400">
          Additional frameworks on request. Each org admin can enable or disable
          frameworks per workspace.
        </p>
      </div>
    </section>
  );
}
