export function LogoBar() {
  const companies = [
    "Acme Corp",
    "Meridian Group",
    "Nexus Industries",
    "Vanta Solutions",
    "CoreTrust Ltd",
    "Apex Systems",
  ];

  return (
    <section className="border-y border-gray-100 bg-gray-50 py-8 px-6">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
          Trusted by compliance teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {companies.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-gray-300 tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
