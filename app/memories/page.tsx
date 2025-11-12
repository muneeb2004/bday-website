import MemoryTimeline from "@/components/MemoryTimeline";

export default function MemoriesPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="mb-10 text-center">
        <h1 className="heading-font text-4xl font-extrabold tracking-tight text-deeppurple sm:text-5xl">
          Our Memories
        </h1>
        <p className="mx-auto mt-2 max-w-prose text-foreground/75">
          Scroll through the years and tap any photo to view it larger.
        </p>
      </section>

      <MemoryTimeline />

      <div className="mt-10 flex justify-center">
        <a href="/" className="btn rounded-full border border-black/10 px-5 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
          Back to landing
        </a>
      </div>
    </main>
  );
}
