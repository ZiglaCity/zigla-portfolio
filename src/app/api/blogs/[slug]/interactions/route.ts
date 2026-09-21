import { NextResponse } from "next/server";
import { getBlogInteractions } from "@@/lib/blog/blog-interactions.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    return NextResponse.json(await getBlogInteractions(slug));
  } catch (error) {
    if (error instanceof Error && error.message === "BLOG_NOT_FOUND") {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    console.error("Failed to load blog interactions:", error);
    return NextResponse.json(
      { error: "Interactions are temporarily unavailable" },
      { status: 503 },
    );
  }
}
