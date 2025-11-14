export default function SectionWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="min-h-screen flex items-center justify-center px-6 py-6 snap-start"
    >
      <div className="w-full max-w-6xl">{children}</div>
    </section>
  );
}
