import { NextRequest, NextResponse } from "next/server";
import {
  assertBlogExists,
  createBlogComment,
} from "@@/lib/blog/blog-interactions.service";
import { commentInputSchema } from "@@/lib/blog/blog-interactions.validation";
import { getRequestFingerprint } from "@@/lib/security/request-fingerprint";
import { notifyNewBlogComment } from "@@/lib/mail/blog-notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    assertBlogExists(slug);
    const payload = await request.json();
    const parsed = commentInputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid comment and optional name" },
        { status: 400 },
      );
    }

    if (parsed.data.imageUrl) {
      return NextResponse.json(
        { error: "Image attachments are not enabled yet" },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json(
        { message: "Comment received" },
        { status: 201 },
      );
    }

    const comment = await createBlogComment(
      slug,
      getRequestFingerprint(request),
      {
        displayName: parsed.data.displayName,
        body: parsed.data.body,
      },
    );
    await notifyNewBlogComment({
      slug,
      displayName: comment.displayName,
      body: comment.body,
    });
    return NextResponse.json({ comment }, { status: 201 });
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
        { error: "Comment limit reached for now" },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
    console.error("Failed to create blog comment:", error);
    return NextResponse.json(
      { error: "Unable to add comment" },
      { status: 503 },
    );
  }
}
