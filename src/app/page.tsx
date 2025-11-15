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
