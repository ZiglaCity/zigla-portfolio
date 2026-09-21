import { NextRequest, NextResponse } from "next/server";
import {
  assertBlogExists,
  recordBlogView,
} from "@@/lib/blog/blog-interactions.service";
import { getRequestFingerprint } from "@@/lib/security/request-fingerprint";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    assertBlogExists(slug);
    const result = await recordBlogView(slug, getRequestFingerprint(request));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BLOG_NOT_FOUND") {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      const retryAfterSeconds = Number(
        (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds ??
          60,
      );
      return NextResponse.json(
        { error: "Too many view requests" },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
      );
    }
    console.error("Failed to record blog view:", error);
    return NextResponse.json(
      { error: "Unable to record view" },
      { status: 503 },
    );
  }
}
