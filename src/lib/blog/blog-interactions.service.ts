import { getBlogBySlug } from "@@/data/blogs";
import { getDatabase } from "@@/lib/neon/db";
import {
  consumeRateLimit,
  type RateLimitAction,
} from "@@/lib/security/rate-limit";
import {
  isValidBlogSlug,
  type ReactionType,
} from "./blog-interactions.validation";

export type BlogComment = {
  id: number;
  blogSlug: string;
  displayName: string | null;
  body: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type ReactionCounts = Record<ReactionType, number>;

export function assertBlogExists(slug: string) {
  if (!isValidBlogSlug(slug) || !getBlogBySlug(slug)) {
    throw new Error("BLOG_NOT_FOUND");
  }
}

function mapComment(row: Record<string, unknown>): BlogComment {
  return {
    id: Number(row.id),
    blogSlug: String(row.blog_slug),
    displayName: row.display_name ? String(row.display_name) : null,
    body: String(row.body),
    imageUrl: row.image_url ? String(row.image_url) : null,
    status: row.status as BlogComment["status"],
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function getBlogInteractions(slug: string) {
  assertBlogExists(slug);
  const database = getDatabase();
  const [commentRows, viewRows, reactionRows] = await Promise.all([
    database`
      select id, blog_slug, display_name, body, image_url, status, created_at
      from blog_comments
      where blog_slug = ${slug}
      order by created_at desc
    `,
    database`
      select count(*)::int as count
      from blog_view_events
      where blog_slug = ${slug}
    `,
    database`
      select reaction_type, count(*)::int as count
      from blog_reaction_events
      where blog_slug = ${slug}
      group by reaction_type
    `,
  ]);

  const reactions: ReactionCounts = {
    like: 0,
    love: 0,
    fire: 0,
    laugh: 0,
    insightful: 0,
  };

  for (const row of reactionRows as Record<string, unknown>[]) {
    const reactionType = String(row.reaction_type) as ReactionType;
    if (reactionType in reactions) reactions[reactionType] = Number(row.count);
  }

  const viewResult = viewRows as unknown as Record<string, unknown>[];

  return {
    views: Number(viewResult[0]?.count ?? 0),
    comments: (commentRows as Record<string, unknown>[]).map(mapComment),
    reactions,
  };
}

export async function enforceInteractionRateLimit(
  fingerprint: string,
  action: RateLimitAction,
) {
  const result = await consumeRateLimit(fingerprint, action);
  if (!result.allowed) {
    const error = new Error("RATE_LIMITED");
    Object.assign(error, { retryAfterSeconds: result.retryAfterSeconds });
    throw error;
  }
  return result;
}

export async function recordBlogView(slug: string, fingerprint: string) {
  assertBlogExists(slug);
  await enforceInteractionRateLimit(`${fingerprint}:${slug}`, "views");
  const database = getDatabase();
  const rows = await database`
    insert into blog_view_cooldowns
      (blog_slug, request_fingerprint_hash, last_view_at)
    values
      (${slug}, ${fingerprint}, now())
    on conflict (blog_slug, request_fingerprint_hash)
    do update set last_view_at = now()
    where blog_view_cooldowns.last_view_at <= now() - interval '10 minutes'
    returning id
  `;

  const cooldownRows = rows as unknown as Record<string, unknown>[];
  if (cooldownRows.length > 0) {
    await database`
      insert into blog_view_events (blog_slug, request_fingerprint_hash)
      values (${slug}, ${fingerprint})
    `;
  }

  const countRows = await database`
    select count(*)::int as count
    from blog_view_events
    where blog_slug = ${slug}
  `;
  const resultRows = countRows as unknown as Record<string, unknown>[];
  return { views: Number(resultRows[0]?.count ?? 0) };
}

export async function createBlogComment(
  slug: string,
  fingerprint: string,
  input: { displayName: string; body: string },
) {
  assertBlogExists(slug);
  await enforceInteractionRateLimit(`${fingerprint}:${slug}`, "comments");
  const database = getDatabase();
  const rows = await database`
    insert into blog_comments
      (blog_slug, display_name, body, image_url, status, request_fingerprint_hash)
    values
      (${slug}, ${input.displayName || null}, ${input.body}, null, 'pending', ${fingerprint})
    returning id, blog_slug, display_name, body, image_url, status, created_at
  `;
  const commentRows = rows as unknown as Record<string, unknown>[];
  return mapComment(commentRows[0]);
}

export async function recordBlogReaction(
  slug: string,
  fingerprint: string,
  reactionType: ReactionType,
) {
  assertBlogExists(slug);
  await enforceInteractionRateLimit(`${fingerprint}:${slug}`, "reactions");
  const database = getDatabase();
  await database`
    insert into blog_reaction_events
      (blog_slug, reaction_type, request_fingerprint_hash)
    values
      (${slug}, ${reactionType}, ${fingerprint})
    on conflict (blog_slug, request_fingerprint_hash)
    where request_fingerprint_hash is not null
    do update set reaction_type = excluded.reaction_type
  `;

  const rows = await database`
    select reaction_type, count(*)::int as count
    from blog_reaction_events
    where blog_slug = ${slug}
    group by reaction_type
  `;
  const reactions: ReactionCounts = {
    like: 0,
    love: 0,
    fire: 0,
    laugh: 0,
    insightful: 0,
  };
  for (const row of rows as Record<string, unknown>[]) {
    const type = String(row.reaction_type) as ReactionType;
    if (type in reactions) reactions[type] = Number(row.count);
  }
  return reactions;
}
