import { NextRequest, NextResponse } from "next/server";
import {
  assertBlogExists,
  recordBlogReaction,
} from "@@/lib/blog/blog-interactions.service";
import { reactionInputSchema } from "@@/lib/blog/blog-interactions.validation";
import { getRequestFingerprint } from "@@/lib/security/request-fingerprint";
import { notifyNewBlogReaction } from "@@/lib/mail/blog-notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    assertBlogExists(slug);
    const parsed = reactionInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Unsupported reaction" },
        { status: 400 },
      );
    }

    const reactions = await recordBlogReaction(
      slug,
      getRequestFingerprint(request),
      parsed.data.reactionType,
    );
    await notifyNewBlogReaction({
      slug,
      reactionType: parsed.data.reactionType,
    });
    return NextResponse.json({ reactions }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BLOG_NOT_FOUND") {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      const retryAfterSeconds = Number(
        (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds ??
          3600,
      );
      return NextResponse.json(
        { error: "Reaction limit reached for now" },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
    console.error("Failed to record blog reaction:", error);
    return NextResponse.json(
      { error: "Unable to record reaction" },
      { status: 503 },
    );
  }
}
