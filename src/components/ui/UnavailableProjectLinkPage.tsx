type UnavailableProjectLinkPageProps = {
  projectName: string;
  clickType: "code" | "demo";
};

const clickTypeLabel: Record<
  UnavailableProjectLinkPageProps["clickType"],
  string
> = {
  code: "source code",
  demo: "demo",
};

export default function UnavailableProjectLinkPage({
  projectName,
  clickType,
}: UnavailableProjectLinkPageProps) {
  const actionLabel = clickTypeLabel[clickType];
  const isDemoClick = clickType === "demo";

  const subMessage = isDemoClick
    ? "This demo is private/internal. Are you serious right now bro?"
    : "This repo is private. Are you serious right now bro?";

  const detailsMessage = isDemoClick
    ? "Some client systems are internal tools, so the live dashboard is locked to authorized staff only."
    : "Some client repositories are private by agreement, so source access is restricted.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-red-500/30 blur-3xl" />
        <div className="absolute top-24 right-0 h-96 w-96 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-400/25 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full rounded-3xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))]/80 p-6 shadow-2xl backdrop-blur md:p-10">
          <p className="mb-3 inline-flex rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            Access denied by vibes
          </p>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            You are trying to view the {actionLabel} of
            <span className="block text-cyan-400">{projectName}</span>
          </h1>

          <p className="mt-4 text-lg text-[rgb(var(--muted))] sm:text-xl">
            {subMessage}
          </p>

          <p className="mt-2 text-sm text-[rgb(var(--muted))] sm:text-base">
            {detailsMessage}
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl border border-[rgb(var(--card-border))] bg-black/30">
            <img
              src="/assets/memes/are-you-serious-right-now-bro.jpg"
              alt="iShowSpeed meme saying are you serious right now bro"
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/projects"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Back to projects
            </a>
            <a
              href="/"
              className="rounded-xl border border-[rgb(var(--card-border))] px-4 py-2 text-sm font-semibold text-[rgb(var(--foreground))] transition hover:bg-[rgb(var(--card-border))]"
            >
              Go home
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
