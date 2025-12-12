"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  // MessageCircle,
} from "lucide-react";
import { getBlogBySlug } from "@@/data/blogs";
import ClientWrapper from "@@/components/ClientWrapper";
import ThemeToggle from "@@/components/ui/ThemeToggle";

export default function BlogPostClient({ slug_ }: { slug_?: string | null }) {
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const slug = params?.slug || slug_ || "";

  const blog = getBlogBySlug(slug as string);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out "${blog?.title}" by Zigla City`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  // const shareOnTelegram = () => {
  //   window.open(
  //     `https://t.me/share/url?url=${encodeURIComponent(
  //       shareUrl
  //     )}&text=${encodeURIComponent(shareText)}`,
  //     "_blank"
  //   );
  // };

  if (!blog) {
    return (
      <ClientWrapper>
        <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              Blog Not Found
            </h1>
            <p className="text-[rgb(var(--muted))] mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <a
              href="/blogs"
              className="inline-flex items-center px-6 py-3 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-[rgb(var(--foreground))] rounded-lg hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
            </a>
          </div>
        </div>
      </ClientWrapper>
    );
  }

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <ThemeToggle />

        <div className=" py-16  bg-[rgb(var(--header-bg))]">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <a
              href="/blogs"
              className="inline-flex items-center text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </a>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--muted))] mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> {blog.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" /> {blog.readTime}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[rgb(var(--foreground))] mb-6 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl text-[rgb(var(--muted))] mb-8 leading-relaxed">
              {blog.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[rgb(var(--card-bg))] text-[rgb(var(--muted))] border border-[rgb(var(--card-border))]"
                >
                  <Tag className="w-3 h-3 mr-1" /> {tag}
                </span>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-[rgb(var(--muted))]">Share:</span>
              <button
                onClick={shareOnFacebook}
                className="p-2 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] hover:bg-[rgb(var(--background))] transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4 text-blue-500" />
              </button>
              {/* <button
                onClick={shareOnTelegram}
                className="p-2 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] hover:bg-[rgb(var(--background))] transition-colors"
                aria-label="Share on Telegram"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </button> */}
              <button
                onClick={shareOnTwitter}
                className="p-2 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] hover:bg-[rgb(var(--background))] transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] hover:bg-[rgb(var(--background))] transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-[rgb(var(--card-bg))] rounded-lg border border-[rgb(var(--card-border))] hover:bg-[rgb(var(--background))] transition-colors"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-[rgb(var(--muted))]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {blog.image && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-auto rounded-xl border border-[rgb(var(--card-border))]"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
                className="blog-content"
              />
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--card-bg))] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-4">
              Enjoyed this post?
            </h2>
            <p className="text-xl text-[rgb(var(--muted))] mb-8">
              Let's connect and discuss more about technology, security, and
              innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-[rgb(var(--foreground))] rounded-lg font-semibold hover:bg-cyan-600 dark:hover:bg-cyan-300 transition-colors"
              >
                Get In Touch
              </a>
              <a
                href="/blogs"
                className="px-8 py-4 border-2 border-[rgb(var(--card-border))] text-[rgb(var(--muted))] rounded-lg font-semibold hover:border-cyan-500 hover:text-cyan-500 dark:hover:border-cyan-400 dark:hover:text-cyan-400 transition-colors"
              >
                Read More Posts
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
