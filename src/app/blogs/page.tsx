"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { getBlogs, getAllTags } from "@@/data/blogs";
import ClientWrapper from "@@/components/ClientWrapper";
import ThemeToggle from "@@/components/ui/ThemeToggle";
import ParticleCanvas from "@@/components/ui/ParticleCanvas";
import { Metadata } from "next";

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const blogs = getBlogs();
  const allTags = getAllTags();

  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => blog.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [blogs, searchTerm, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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
              <span className="text-cyan-500 dark:text-cyan-400">Blogs</span>
            </h1>
            <p className="text-xl text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Thoughts, insights, and stories from the intersection of code and
              creativity.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="mb-12 space-y-6">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted))] focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent"
              />
            </div>

            {/* Tag Filters + Sort */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    selectedTags.includes(tag)
                      ? "bg-cyan-500 dark:bg-cyan-400 text-white dark:text-gray-900"
                      : "bg-[rgb(var(--card-bg))] text-[rgb(var(--muted))] border border-[rgb(var(--card-border))] hover:bg-opacity-80"
                  }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border rounded-lg border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))] text-[rgb(var(--foreground))] focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            {/* Active Filters */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))] flex-wrap">
                <span>Active filters:</span>

                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded-md"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-100"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <button
                  onClick={() => setSelectedTags([])}
                  className="text-cyan-500 dark:text-cyan-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Blog Grid */}
          {filteredAndSortedBlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-cyan-400/10 transition-all duration-300 transform hover:-translate-y-2 bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))]"
                >
                  <div className="h-48 bg-[rgb(var(--card-border))] flex items-center justify-center">
                    <div className="text-4xl text-cyan-500 dark:text-cyan-400 font-mono">
                      {blog.title.charAt(0)}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-[rgb(var(--muted))] mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {blog.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {blog.readTime}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-[rgb(var(--foreground))] mb-3 line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-[rgb(var(--muted))] text-sm leading-relaxed mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[rgb(var(--card-border))] text-[rgb(var(--muted))] text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="px-2 py-1 bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] text-[rgb(var(--muted))] text-xs rounded-md">
                          +{blog.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <a
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium text-sm transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-[rgb(var(--muted))] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                No blogs found
              </h3>
              <p className="text-[rgb(var(--muted))]">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </ClientWrapper>
  );
}
