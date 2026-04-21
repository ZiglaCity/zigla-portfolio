export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 rounded-full border border-red-400/40 bg-red-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Wrong turn, legend
        </p>

        <h1 className="text-6xl font-black leading-none text-cyan-400 sm:text-7xl md:text-8xl">
          404
        </h1>

        <p className="mt-4 text-2xl font-bold sm:text-3xl">
          This page dipped faster than your last deploy.
        </p>

        <p className="mt-3 max-w-xl text-base text-[rgb(var(--muted))] sm:text-lg">
          The route you opened does not exist. Maybe it was private, maybe it
          was never shipped, maybe it rage-quit.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Return home
          </a>
          <a
            href="/projects"
            className="rounded-xl border border-[rgb(var(--card-border))] px-5 py-2.5 text-sm font-semibold text-[rgb(var(--foreground))] transition hover:bg-[rgb(var(--card-border))]"
          >
            View projects
          </a>
        </div>
      </section>
    </main>
  );
}
