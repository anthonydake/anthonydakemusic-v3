"use client"

import Link from "next/link"
import { useMemo } from "react"

function ScribbleSVG({ seed }: { seed: number }) {
  // Slight variation so it feels hand-drawn, but deterministic per link
  const d = useMemo(() => {
    const wobble = (n: number) => (Math.sin(seed * 999 + n) * 1.8).toFixed(2)
    return `M 10 22
      C 10 10, 22 6, 32 8
      C 42 10, 46 18, 44 26
      C 42 34, 34 40, 24 40
      C 14 40, 8 34, 10 22
      C 12 14, 20 10, 30 12
      C 40 14, 42 20, 40 26
      C 38 32, 32 36, 24 36
      C 16 36, 12 32, 12 24
      C 12 18, 16 14, 22 14
      C 28 14, 32 16, 34 20
      C 36 24, 34 28, 30 30
      C 26 32, 20 30, 18 26
      C 16 22, 18 18, 22 18
      C 26 18, 28 20, 28 22`
      .replace(/(\d+)\s(\d+)/g, (m, a, b, idx) => {
        // small distortion across coordinate pairs
        const i = Number(idx) || 0
        const dx = Number(wobble(i)) * 0.2
        const dy = Number(wobble(i + 1)) * 0.2
        return `${(Number(a) + dx).toFixed(2)} ${(Number(b) + dy).toFixed(2)}`
      })
  }, [seed])

  return (
    <svg
      className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      viewBox="0 0 54 46"
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-900/90 dark:text-zinc-50/90"
      />
    </svg>
  )
}

export function ScribbleLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const seed = href.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)

  return (
    <Link
      href={href}
      className="group relative inline-flex items-center px-1 py-0.5 text-sm tracking-tight text-black/70 hover:text-black"
      style={{ textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: "4px", transition: "text-decoration-color 200ms" }}
    >
      <ScribbleSVG seed={seed} />
      <span className="relative z-10">{children}</span>
    </Link>
  )
}
