export function StatusPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}
