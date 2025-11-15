"use client";

import { useState } from "react";
import { ExternalLink, Github, Shield, Code, Brain, Globe } from "lucide-react";
import ClientWrapper from "@@/components/ClientWrapper";
import ParticleCanvas from "@@/components/ui/ParticleCanvas";
import ThemeToggle from "@@/components/ui/ThemeToggle";
import { Metadata } from "next";

interface Project {
  id: number;
  title: string;
  categories: string[];
  description: string;
  image?: any;
  tags: string[];
  github: string;
  demo?: string | null;
  featured: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Enzypher",
    categories: ["Messaging / Security", "Full-Stack"],
    description:
      "End-to-end encrypted chat application where messages are securely stored and transmitted as cypher text, ensuring complete privacy and confidentiality.",
    image: new URL(
      "../../../public/assets/projects/enzypher1.png",
      import.meta.url
    ).href,
    tags: ["Next.js", "TypeScript", "WebSocket", "Encryption", "Supabase"],
    github: "https://github.com/ziglacity/enzypher",
    demo: "#",
    featured: true,
  },
  {
    id: 2,
    title: "SafestCode",
    categories: ["Security Tools", "AI/ML"],
    description:
      "Static code analysis platform that scans codebases for security vulnerabilities and provides actionable remediation suggestions.",
    image: new URL(
      "../../../public/assets/projects/safestcode.png",
      import.meta.url
    ).href,
    tags: ["Node.js", "Security", "Static Analysis", "React"],
    github: "https://github.com/ziglacity/safestcode",
    demo: "https://safest-code.vercel.app/",
    featured: true,
  },
  {
    id: 3,
    title: "LMS",
    categories: ["Desktop App", "Full-Stack"],
    description: "Full-featured Library Management System for Universities.",
    image: new URL("../../../public/assets/projects/lms.png", import.meta.url)
      .href,
    tags: ["Python", "MySQL", "Tkinter"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 4,
    title: "ProxyPhish",
    categories: ["CyberOps"],
    description:
      "Advanced phishing detection and prevention tool using machine learning algorithms to identify and block malicious websites in real-time.",
    image: new URL(
      "../../../public/assets/projects/proxyphish.png",
      import.meta.url
    ).href,
    tags: ["Python", "Machine Learning", "Cybersecurity", "Flask"],
    github: "https://github.com/ziglacity/proxyphish",
    demo: "#",
    featured: true,
  },
  {
    id: 5,
    title: "ZTube",
    categories: ["Desktop App", "Full-Stack"],
    description:
      "Desktop app for streaming and downloading videos, providing a clean interface and smooth media playback experience.",
    image: new URL("../../../public/assets/projects/ztube.png", import.meta.url)
      .href,
    tags: ["Python", "Tkinter", "Pytube"],
    github: "https://github.com/ziglacity/ztube",
    demo: null,
    featured: false,
  },
  {
    id: 6,
    title: "Zigly",
    categories: ["Full-Stack"],
    description:
      "A fast and reliable URL shortener that provides link analytics and easy management for shared links.",
    tags: ["Next.js", "TypeScript", "Vercel", "Analytics"],
    github: "https://github.com/ziglacity/zigly",
    demo: "#",
    featured: false,
  },
  {
    id: 7,
    title: "Focus Drain",
    categories: ["Chrome Extension"],
    description:
      "Chrome extension that tracks focus levels, helps monitor productivity, and provides insights on browser usage habits.",
    tags: ["TypeScript", "Chrome Extension API", "Productivity"],
    github: "https://github.com/ziglacity/focus-drain",
    demo: null,
    featured: false,
  },
  {
    id: 8,
    title: "CropDoc",
    categories: ["AI/ML"],
    description:
      "Backend System for an AI-powered crop disease detection app for farmers.",
    image: new URL(
      "../../../public/assets/projects/cropdoc.png",
      import.meta.url
    ),
    tags: ["Python", "Torch", "FastAPI", "Supabase"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 9,
    title: "ScreenRecorder",
    categories: ["Desktop App"],
    description: "Lightweight screen recording tool with quick share options.",
    image: new URL(
      "../../../public/assets/projects/zscreen.png",
      import.meta.url
    ),
    tags: ["Python", "Tkinter"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 10,
    title: "Prosper Constructions Ltd",
    categories: ["Website"],
    description:
      "The official website of a constructions company based in Ghana",
    image: new URL(
      "../../../public/assets/projects/pc-ltd.png",
      import.meta.url
    ),
    tags: ["Next.js", "Typescript", "Tailwind CSS"],
    github: "https://github.com/ZiglaCity/prosper-constructions-ltd",
    demo: "https://prosper-constructions-ltd.vercel.app/",
    featured: true,
  },
  {
    id: 11,
    title: "Neural Task Manager",
    categories: ["AI/ML", "WIP"],
    description:
      "Intelligent task management system that learns from user behavior to optimize productivity and suggest task prioritization.",
    tags: ["Python", "TensorFlow", "React", "PostgreSQL"],
    github: "#",
    demo: "#",
    featured: false,
  },
];

const categories = [
  "All",
  "CyberOps",
  "Security Tools",
  "AI/ML",
  "Full-Stack",
  "DevOps",
  "Desktop App",
  "Chrome Extension",
  "Messaging / Security",
  "WIP",
  "Website",
];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFeatured, setShowFeatured] = useState<boolean>(false);

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" ||
      project.categories.includes(selectedCategory);
    const matchesFeatured = !showFeatured || project.featured;
    return matchesCategory && matchesFeatured;
  });

  // ← USES FIRST MATCHING CATEGORY
  const getCategoryIcon = (categories: string[]) => {
    const cat = categories[0]; // Use first for icon
    switch (cat) {
      case "CyberOps":
      case "Security Tools":
      case "Messaging / Security":
        return <Shield className="w-5 h-5" />;
      case "AI/ML":
        return <Brain className="w-5 h-5" />;
      case "Full-Stack":
      case "Chrome Extension":
        return <Globe className="w-5 h-5" />;
      case "DevOps":
      case "Desktop App":
        return <Code className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-[rgb(var(--background))] py-16">
        <ParticleCanvas />
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-[rgb(var(--foreground))] mb-6 font-mono">
              My <span className="text-cyan-500">Projects</span>
            </h1>
            <p className="text-xl text-[rgb(var(--muted))] max-w-2xl mx-auto">
              A collection of projects where security meets innovation, and code
              becomes art.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-cyan-500 text-white"
                      : "bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--card-border))]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e) => setShowFeatured(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  showFeatured ? "bg-cyan-500" : "bg-[rgb(var(--card-border))]"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    showFeatured ? "translate-x-6" : "translate-x-0.5"
                  } mt-0.5`}
                ></div>
              </div>
              <span className="text-sm text-[rgb(var(--muted))]">
                Featured Only
              </span>
            </label>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[rgb(var(--card-bg))] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[rgb(var(--card-border))]"
              >
                <div className="h-48 bg-[rgb(var(--card-border))] flex items-center justify-center">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl text-cyan-500">
                      {getCategoryIcon(project.categories)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--card-border))] text-[rgb(var(--muted))]">
                      {getCategoryIcon(project.categories)}
                      <span className="ml-1">{project.categories[0]}</span>
                    </span>

                    {project.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-3">
                    {project.title}
                  </h3>

                  <p className="text-[rgb(var(--muted))] text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[rgb(var(--card-border))] text-[rgb(var(--muted))] text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-[rgb(var(--card-border))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgb(var(--muted))]/20 transition-colors text-sm"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Code
                    </a>

                    {project.demo && project.demo !== "#" && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Code className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                No projects found
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Try adjusting your filters to see more projects.
              </p>
            </div>
          )}
        </div>
        <p className="mt-12 text-base italic text-center text-[rgb(var(--muted))]">
          "One Encrypted Byte at a Time"
        </p>
      </div>
    </ClientWrapper>
  );
}
