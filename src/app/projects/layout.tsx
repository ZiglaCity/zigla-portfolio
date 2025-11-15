import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Zigla City",
  description:
    "Explore Solomon Dzah's projects — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
  openGraph: {
    title: "Projects | Zigla City",
    description:
      "Explore Solomon Dzah's projects — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    url: "https://ziglacity.tech/projects",
    images: [
      {
        url: "/zigla.png",
        width: 800,
        height: 800,
        alt: "Zigla City Projects",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Zigla City",
    description:
      "Explore Solomon Dzah's projects — Software Engineer, AI/ML Developer, Cybersecurity Learner.",
    images: ["/zigla.png"],
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
