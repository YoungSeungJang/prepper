export function StatusPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#eadccd] bg-[#fffaf3] p-4">
      <h2 className="text-sm font-semibold text-[#211b16]">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[#6d5e52]">{children}</div>
    </section>
  );
}
