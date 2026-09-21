"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Flame,
  Heart,
  Laugh,
  Lightbulb,
  LoaderCircle,
  Send,
  ThumbsUp,
} from "lucide-react";

const REACTIONS = [
  { key: "like", label: "Like", icon: ThumbsUp },
  { key: "love", label: "Love", icon: Heart },
  { key: "fire", label: "Fire", icon: Flame },
  { key: "laugh", label: "Laugh", icon: Laugh },
  { key: "insightful", label: "Insightful", icon: Lightbulb },
] as const;

type Comment = {
  id: number;
  displayName: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type ReactionCounts = Record<(typeof REACTIONS)[number]["key"], number>;

type InteractionResponse = {
  views: number;
  comments: Comment[];
  reactions: ReactionCounts;
  viewerReaction: ReactionKey | null;
};

type ReactionKey = (typeof REACTIONS)[number]["key"];

const emptyReactions: ReactionCounts = {
  like: 0,
  love: 0,
  fire: 0,
  laugh: 0,
  insightful: 0,
};

export default function BlogInteractions({ slug }: { slug: string }) {
  const [data, setData] = useState<InteractionResponse>({
    views: 0,
    comments: [],
    reactions: emptyReactions,
    viewerReaction: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reacting, setReacting] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadInteractions = async () => {
      try {
        const [interactionsResponse, viewResponse] = await Promise.all([
          fetch(`/api/blogs/${encodeURIComponent(slug)}/interactions`, {
            cache: "no-store",
          }),
          fetch(`/api/blogs/${encodeURIComponent(slug)}/views`, {
            method: "POST",
          }),
        ]);

        if (!interactionsResponse.ok)
          throw new Error("Unable to load interactions");
        const interactions =
          (await interactionsResponse.json()) as InteractionResponse;
        const viewUpdate = viewResponse.ok
          ? ((await viewResponse.json()) as { views?: number })
          : null;

        if (!cancelled) {
          setData({
            ...interactions,
            views: viewUpdate?.views ?? interactions.views,
          });
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadInteractions();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/blogs/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: name, body, website: honeypot }),
        },
      );
      const result = (await response.json()) as {
        comment?: Comment;
        error?: string;
      };

      if (!response.ok)
        throw new Error(result.error || "Unable to add comment");
      if (result.comment) {
        setData((current) => ({
          ...current,
          comments: [result.comment!, ...current.comments],
        }));
      }
      setName("");
      setBody("");
      setHoneypot("");
      setMessage("Comment added.");
    } catch (submissionError) {
      setMessage(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to add comment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitReaction = async (reactionType: string) => {
    setReacting(reactionType);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/blogs/${encodeURIComponent(slug)}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
        },
      );
      const result = (await response.json()) as {
        reactions?: ReactionCounts;
        viewerReaction?: ReactionKey | null;
        error?: string;
      };
      if (!response.ok || !result.reactions || !("viewerReaction" in result)) {
        throw new Error(result.error || "Unable to record reaction");
      }
      setData((current) => ({
        ...current,
        reactions: result.reactions!,
        viewerReaction: result.viewerReaction ?? null,
      }));
    } catch (reactionError) {
      setMessage(
        reactionError instanceof Error
          ? reactionError.message
          : "Unable to record reaction.",
      );
    } finally {
      setReacting(null);
    }
  };

  return (
    <section className="blog-interactions mt-16 border-t border-[rgb(var(--card-border))] pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
            Join the conversation
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[rgb(var(--foreground))]">
            What did you think?
          </h2>
        </div>
        <p className="text-sm text-[rgb(var(--muted))]">
          {data.views.toLocaleString()} {data.views === 1 ? "read" : "reads"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {REACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => void submitReaction(key)}
            disabled={Boolean(reacting) || loading}
            aria-pressed={data.viewerReaction === key}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              data.viewerReaction === key
                ? "border-cyan-500 bg-cyan-500/12 text-cyan-600 shadow-[inset_0_-2px_0_rgba(6,182,212,0.75)] dark:text-cyan-300"
                : "border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))] text-[rgb(var(--muted))] hover:border-cyan-400/60 hover:text-cyan-500"
            }`}
            aria-label={`React ${label}`}
          >
            {reacting === key ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            <span>{label}</span>
            <span className="font-semibold text-[rgb(var(--foreground))]">
              {data.reactions[key]}
            </span>
          </button>
        ))}
      </div>
      {data.viewerReaction ? (
        <p className="mt-3 text-xs text-[rgb(var(--muted))]">
          Your reaction:{" "}
          <span className="font-semibold text-[rgb(var(--foreground))]">
            {data.viewerReaction}
          </span>
          . Click it again to remove it.
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form
          onSubmit={submitComment}
          className="rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))]/70 p-5"
        >
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
            Leave a comment
          </h3>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Your name is optional. Comments appear immediately for now.
          </p>
          <label className="sr-only" htmlFor="comment-name">
            Name
          </label>
          <input
            id="comment-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Name (optional)"
            className="mt-5 w-full rounded-xl border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] px-3 py-2.5 text-sm text-[rgb(var(--foreground))] outline-none transition focus:border-cyan-400"
          />
          <label className="sr-only" htmlFor="comment-body">
            Comment
          </label>
          <textarea
            id="comment-body"
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Write something thoughtful..."
            className="mt-3 w-full resize-y rounded-xl border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] px-3 py-2.5 text-sm text-[rgb(var(--foreground))] outline-none transition focus:border-cyan-400"
          />
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Add comment
          </button>
          {message ? (
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{message}</p>
          ) : null}
        </form>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Comments{" "}
              <span className="text-[rgb(var(--muted))]">
                ({data.comments.length})
              </span>
            </h3>
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-cyan-500" />
            ) : null}
          </div>
          {error ? (
            <p className="mt-4 rounded-xl border border-[rgb(var(--card-border))] p-4 text-sm text-[rgb(var(--muted))]">
              Comments are temporarily unavailable. The article is still fully
              readable.
            </p>
          ) : data.comments.length === 0 && !loading ? (
            <p className="mt-4 text-sm text-[rgb(var(--muted))]">
              No comments yet. Start the conversation.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))]/55 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-[rgb(var(--foreground))]">
                      {comment.displayName || "Anonymous"}
                    </strong>
                    <time
                      className="text-xs text-[rgb(var(--muted))]"
                      dateTime={comment.createdAt}
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[rgb(var(--muted))]">
                    {comment.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
