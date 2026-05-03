import { Metadata } from "next";
import AboutClient from "./page.client";

export const metadata: Metadata = {
  title: "ABOUT",
  description: "From small-town church drummer to world-class performer. The story of Anthony Dake.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}
