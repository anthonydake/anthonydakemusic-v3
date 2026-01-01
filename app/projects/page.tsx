import Link from "next/link"
import { projects } from "@/lib/projects"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="text-sm font-semibold">{p.title}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{p.subtitle}</div>
            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {p.role} • {p.year}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
