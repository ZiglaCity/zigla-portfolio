"use client";

import { useRef } from "react";
import ParticleCanvas from "@@/components/ui/ParticleCanvas";
import SectionWrapper from "@@/components/ui/SectionWrapper";
import Hero from "@@/components/sections/Hero";
import About from "@@/components/sections/About";
import Skills from "@@/components/sections/Skills";
import Experience from "@@/components/sections/Experience";
import ThemeToggle from "@@/components/ui/ThemeToggle";
import ClientWrapper from "@@/components/ClientWrapper";
import { Metadata } from "next";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ClientWrapper>
      <div className="relative min-h-screen overflow-hidden">
        <ParticleCanvas />
        <ThemeToggle />
        <div
          ref={containerRef}
          className="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory"
        >
          <SectionWrapper id="hero">
            <Hero />
          </SectionWrapper>
          <SectionWrapper id="about">
            <About />
          </SectionWrapper>
          <SectionWrapper id="skills">
            <Skills />
          </SectionWrapper>
          <SectionWrapper id="experience">
            <Experience />
          </SectionWrapper>
        </div>

        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-400">
          © 2025 Zigla City — Built with intent
        </footer>
      </div>
    </ClientWrapper>
  );
}

export const metadata: Metadata = {
  title: "Zigla City | Software Engineer & AI/ML Enthusiast",
  description:
    "Portfolio of Solomon Dzah — Software Engineer, Cybersecurity Learner, AI/ML Developer. Projects, blogs, and contact information.",
  openGraph: {
    title: "Zigla City | Portfolio",
    description:
      "Portfolio of Solomon Dzah — Software Engineer, Cybersecurity Learner, AI/ML Developer.",
    url: "https://ziglacity.tech",
    images: [
      { url: "/zigla.png", width: 800, height: 800, alt: "Zigla City Logo" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zigla City | Portfolio",
    description: "Solomon Dzah — Software Engineer & AI/ML Developer",
    images: ["/zigla.png"],
  },
};
