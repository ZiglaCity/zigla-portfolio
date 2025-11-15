import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Zigla City",
  description:
    "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Enthusiast. Reach out for collaborations or inquiries.",
  openGraph: {
    title: "Contact | Zigla City",
    description:
      "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Enthusiast.",
    url: "https://ziglacity.tech/contact",
    images: [
      { url: "/zigla.png", width: 800, height: 800, alt: "Zigla City Contact" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Zigla City",
    description:
      "Get in touch with Solomon Dzah — Software Engineer, AI/ML Developer, Cybersecurity Enthusiast.",
    images: ["/zigla.png"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
