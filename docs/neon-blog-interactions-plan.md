# Neon Blog Interactions Plan

## Goal

Add dynamic blog interactions without changing the current authoring model:

- Blog titles, content, dates, tags, excerpts, and hero images remain in `src/data/blogs.ts`.
- Neon stores comments, reactions, and view events keyed by the blog `slug`.
- The blog page renders its existing static content first.
- The client loads interaction data after the blog has mounted.
- A temporary Neon outage must not prevent the article from being read.

## Confirmed First-Release Rules

### Comments

- Anonymous comments are allowed.
- A commenter may provide an optional display name.
- Empty display name means the UI displays `Anonymous`.
- Multiple comments from the same visitor are allowed.
- Comments are rate-limited, validated, and stored as `pending`.
- Pending status is stored for future moderation, but the first release returns all comments regardless of status.
- Comment text is rendered as plain text. User HTML is never injected into the page.
- `image_url` exists in the schema and service type as nullable, but image upload controls and image processing are disabled in the first release.
- The API rejects image upload fields for now rather than silently accepting unhandled data.

### Views

- Each accepted view request represents a read and increments the blog's view count.
- The same device, browser, IP address, or visitor may generate multiple views.
- There is no view deduplication.
- The client sends one view request after the blog detail component mounts. Refreshing or revisiting sends another request.
- Basic request throttling still protects the endpoint from an abusive tight loop without deduplicating normal reads.

### Reactions

- Reactions are anonymous and use a fixed allowlist: `like`, `love`, `fire`, `laugh`, and `insightful`.
- Each accepted reaction is an event and contributes to the aggregate count.
- Reactions are rate-limited but not tied to an account.
- The API returns counts grouped by reaction type.
- A later release can add visitor-level toggling without changing the blog content model.

## Target Architecture

```text
src/app/blogs/[slug]/page.tsx
  -> validates the slug using blogs.ts
  -> renders BlogPostClient

BlogPostClient
  -> renders the existing static article
  -> mounts BlogInteractions after render
  -> fetches dynamic data from route handlers

Route handlers
  -> parse request and slug
  -> validate input with Zod
  -> apply server-side rate limits
  -> call the interaction service
  -> return safe JSON

Interaction service
  -> owns all SQL and transaction boundaries
  -> never imported by client components
  -> reads/writes Neon through the server-only database client

Neon Postgres
  -> comments
  -> view events
  -> reaction events
  -> rate-limit buckets
```

## Planned File Layout

```text
src/
  app/api/blogs/[slug]/
    interactions/route.ts   # comments + views + reaction counts
    comments/route.ts       # create comment
    reactions/route.ts      # record reaction
    views/route.ts          # record raw view event
  components/blog/
    BlogInteractions.tsx
    CommentForm.tsx
    CommentList.tsx
    ReactionBar.tsx
    ViewCount.tsx
  lib/neon/
    db.ts                   # server-only Neon client
    schema.sql              # migration SQL
  lib/blog/
    blog-interactions.service.ts
    blog-interactions.validation.ts
  lib/security/
    request-fingerprint.ts
    rate-limit.ts
```

## Database Schema

The schema deliberately stores events instead of trying to infer activity from the static blog records. `blog_slug` is the stable relationship key.

```sql
create table blog_comments (
  id bigserial primary key,
  blog_slug text not null,
  display_name varchar(80),
  body varchar(2000) not null,
  image_url text,
  status varchar(20) not null default 'pending',
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now(),
  constraint blog_comments_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index blog_comments_slug_created_idx
  on blog_comments (blog_slug, created_at desc);

create table blog_view_events (
  id bigserial primary key,
  blog_slug text not null,
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now()
);

create index blog_view_events_slug_idx
  on blog_view_events (blog_slug);

create table blog_reaction_events (
  id bigserial primary key,
  blog_slug text not null,
  reaction_type varchar(20) not null,
  request_fingerprint_hash char(64),
  created_at timestamptz not null default now(),
  constraint blog_reaction_type_check
    check (reaction_type in ('like', 'love', 'fire', 'laugh', 'insightful'))
);

create index blog_reactions_slug_type_idx
  on blog_reaction_events (blog_slug, reaction_type);

create table interaction_rate_limit_buckets (
  bucket_key varchar(180) not null,
  action varchar(30) not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  primary key (bucket_key, action, window_start)
);
```

`image_url` remains nullable now. When uploads are enabled later, the service will validate an object key, construct or verify the Neon public-storage URL, and save the final URL only after the comment write succeeds.

## API Contracts

### `GET /api/blogs/[slug]/interactions`

Called after the article mounts.

```ts
type InteractionsResponse = {
  views: number;
  comments: {
    id: number;
    blogSlug: string;
    displayName: string | null;
    body: string;
    imageUrl: string | null;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  }[];
  reactions: {
    like: number;
    love: number;
    fire: number;
    laugh: number;
    insightful: number;
  };
};
```

The first release returns all comment statuses. Filtering to approved comments is a future service-level policy switch, not a client-side security boundary.

### `POST /api/blogs/[slug]/comments`

Uses JSON in the first release because image uploads are disabled.

```json
{
  "displayName": "Optional name",
  "body": "The comment text",
  "website": ""
}
```

`website` is a honeypot field. A non-empty value receives a generic success response but is not stored.

### `POST /api/blogs/[slug]/reactions`

```json
{
  "reactionType": "like"
}
```

The server validates the reaction against the fixed allowlist and returns refreshed counts.

### `POST /api/blogs/[slug]/views`

No request body is required. The server inserts one view event and returns the current count. A modest burst limiter protects the endpoint while preserving repeated legitimate reads.

## Server-Side Security

- Validate the slug against `getBlogBySlug` before any database write or read.
- Keep `DATABASE_URL` and `INTERACTION_HASH_SECRET` server-only.
- Use `@neondatabase/serverless` from route/service modules only.
- Validate bodies with Zod and enforce length limits before SQL.
- Parameterize every query through the Neon client.
- Hash IP, user agent, and a signed visitor token with `INTERACTION_HASH_SECRET`; never store raw IP addresses.
- Use separate rate-limit actions for comments, reactions, views, and future uploads.
- Use a honeypot and duplicate-content checks for comments.
- Return generic errors to clients and log detailed errors server-side.
- Return plain JSON data only; never return SQL errors or secrets.
- Do not trust client-provided `status`, `imageUrl`, timestamps, view counts, or blog titles.

Suggested initial limits:

```text
comments: 3 accepted attempts per fingerprint per hour
reactions: 30 accepted attempts per fingerprint per hour
views: 120 requests per fingerprint per minute, without deduplication
```

These are abuse controls, not view deduplication rules.

## Client Flow

1. `page.tsx` resolves the slug from `blogs.ts` as it does now.
2. `BlogPostClient` renders the article immediately.
3. `BlogInteractions` mounts at the end of the article.
4. It fetches comments, current view count, and reaction counts.
5. It sends a view event once per mount.
6. The comment form submits independently and prepends the returned comment after success.
7. The reaction bar submits one event and reconciles with refreshed counts.
8. Loading, empty, error, and retry states remain local to the interaction section.

The article itself must remain usable when the interaction API fails.

## Image Uploads: Deferred Design

The first release has no file input, multipart route, or upload permission. The schema and types still include nullable `image_url` so the later feature does not require a migration redesign.

When enabled later:

1. Validate MIME type and file size server-side.
2. Upload to the configured Neon public bucket using a controlled object key.
3. Store the resulting public URL in `blog_comments.image_url`.
4. Delete orphaned objects if the comment transaction fails.
5. Render the image through the existing blog lightbox after URL validation.

## Dependencies

Add only when implementation begins:

```text
@neondatabase/serverless
zod
```

No upload dependency is needed while image attachments are disabled. Neon public storage configuration is documented in `.env.example` for the later release.

## Implementation Sequence

1. Install Neon and Zod.
2. Add the server-only Neon client.
3. Apply and document the SQL schema.
4. Add slug validation, request fingerprinting, and rate-limit helpers.
5. Implement the interaction service with transaction-safe writes.
6. Add the four route handlers.
7. Add the client interaction components.
8. Mount the interaction section after the existing article content.
9. Add optimistic reaction updates with server reconciliation.
10. Add comment loading, submission, empty, error, and retry states.
11. Add tests for invalid slugs, malformed input, honeypots, rate limits, repeated views, repeated comments, and reaction allowlists.
12. Run a production build and manually verify several blog slugs.

## Environment Variables

The new names are documented in `.env.example`:

```env
DATABASE_URL=
INTERACTION_HASH_SECRET=
NEON_STORAGE_PUBLIC_BASE_URL=
NEON_STORAGE_BUCKET=
```

The two storage variables are intentionally unused until image attachments are enabled.
