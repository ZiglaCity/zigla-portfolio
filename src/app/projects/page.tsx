"use client";

import { useState } from "react";
import { ExternalLink, Github, Shield, Code, Brain, Globe } from "lucide-react";
import ClientWrapper from "@@/components/ClientWrapper";
import ParticleCanvas from "@@/components/ui/ParticleCanvas";
import ThemeToggle from "@@/components/ui/ThemeToggle";
import { useTheme } from "@@/components/providers/ThemeProvider";
import { projects, Project, categories } from "@@/data/projects";

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFeatured, setShowFeatured] = useState<boolean>(false);
  const { theme } = useTheme();
  console.log("Current theme:", theme);
  console.log("ThemeProvider instance:", useTheme);

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" ||
      project.categories.includes(selectedCategory);
    const matchesFeatured = !showFeatured || project.featured;
    return matchesCategory && matchesFeatured;
  });

  const getProjectImage = (project: Project) => {
    if (!project.image || project.image.length === 0) return null;
    return theme === "light"
      ? project.image[0]
      : project.image[1] || project.image[0];
  };

  const getCategoryIcon = (categories: string[]) => {
    const cat = categories[0];
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
                  {(() => {
                    const imageSrc = project.image
                      ? getProjectImage(project)
                      : null;
                    if (imageSrc) {
                      return (
                        <img
                          src={imageSrc}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    return (
                      <div className="text-6xl text-cyan-500">
                        {getCategoryIcon(project.categories)}
                      </div>
                    );
                  })()}
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
