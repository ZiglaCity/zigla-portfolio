import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs | Zigla City",
  description:
    "Read blogs by Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
  openGraph: {
    title: "Blogs | Zigla City",
    description:
      "Read blogs by Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    url: "https://ziglacity.tech/blogs",
    images: [
      { url: "/zigla.png", width: 800, height: 800, alt: "Zigla City Blogs" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs | Zigla City",
    description:
      "Read blogs by Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    images: ["/zigla.png"],
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
