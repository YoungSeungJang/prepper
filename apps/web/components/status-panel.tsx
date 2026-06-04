export function StatusPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d8d0c6] bg-[#fffdfa] p-4">
      <h2 className="text-sm font-bold text-[#1f2420]">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[#625c54]">{children}</div>
    </section>
  );
}
