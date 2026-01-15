export interface Project {
  id: number;
  title: string;
  categories: string[];
  description: string;
  image?: string[]; // [light, dark]
  tags: string[];
  github: string;
  demo?: string | null;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Enzypher",
    categories: ["Messaging / Security", "Full-Stack"],
    description:
      "End-to-end encrypted chat application where messages are securely stored and transmitted as cypher text, ensuring complete privacy and confidentiality.",
    image: ["/assets/projects/enzypher1.png"],
    tags: ["Next.js", "TypeScript", "WebSocket", "Encryption", "Supabase"],
    github: "https://github.com/ziglacity/enzypher",
    demo: "https://enzypher.vercel.app",
    featured: true,
  },
  {
    id: 2,
    title: "SafestCode",
    categories: ["Security Tools", "AI/ML"],
    description:
      "Static code analysis platform that scans codebases for security vulnerabilities and provides actionable remediation suggestions.",
    image: [
      "/assets/projects/safestcode-light.png",
      "/assets/projects/safestcode-dark.png",
    ],
    tags: ["Node.js", "Security", "Static Analysis", "React"],
    github: "https://github.com/ziglacity/safestcode",
    demo: "https://safest-code.vercel.app/",
    featured: true,
  },
  {
    id: 3,
    title: "LMS",
    categories: ["Desktop App", "Full-Stack"],
    description: "Full-featured Library Management System for Universities.",
    image: ["/assets/projects/lms.png"],
    tags: ["Python", "MySQL", "Tkinter"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 4,
    title: "ProxyPhish",
    categories: ["CyberOps"],
    description:
      "Advanced phishing detection and prevention tool using machine learning algorithms to identify and block malicious websites in real-time.",
    image: ["/assets/projects/proxyphish.png"],
    tags: ["Python", "Machine Learning", "Cybersecurity", "Flask"],
    github: "https://github.com/ziglacity/proxyphish",
    demo: "https://proxyphish.vercel.app/",
    featured: true,
  },
  {
    id: 5,
    title: "ZTube",
    categories: ["Desktop App", "Full-Stack"],
    description:
      "Desktop app for streaming and downloading videos, providing a clean interface and smooth media playback experience.",
    image: [
      "/assets/projects/ztube-light.png",
      "/assets/projects/ztube-dark.png",
    ],
    tags: ["Python", "Tkinter", "Pytube"],
    github: "https://github.com/ziglacity/ztube",
    demo: null,
    featured: false,
  },
  {
    id: 6,
    title: "Zigly",
    categories: ["Full-Stack", "System Design", "Website"],
    description:
      "A clean, fast, and developer-friendly URL shortener which allows custom aliases and provides detailed analytics.",
    image: ["/assets/projects/zigly.png"],
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/ziglacity/zigly",
    demo: "https://zig-ly.vercel.app/",
    featured: false,
  },
  {
    id: 7,
    title: "Focus Drain",
    categories: ["Chrome Extension"],
    description:
      "Chrome extension that tracks focus levels, helps monitor productivity, and provides insights on browser usage habits.",
    tags: ["TypeScript", "Chrome Extension API", "Productivity"],
    github: "https://github.com/ziglacity/focus-drain",
    demo: null,
    featured: false,
  },
  {
    id: 8,
    title: "CropDoc",
    categories: ["AI/ML"],
    description:
      "Backend System for an AI-powered crop disease detection app for farmers.",
    image: ["/assets/projects/cropdoc.png"],
    tags: ["Python", "Torch", "FastAPI", "Supabase"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 9,
    title: "ScreenRecorder",
    categories: ["Desktop App"],
    description: "Lightweight screen recording tool with quick share options.",
    image: ["/assets/projects/zscreen.png"],
    tags: ["Python", "Tkinter"],
    demo: "#",
    github: "#",
    featured: true,
  },
  {
    id: 10,
    title: "Prosper Constructions Ltd",
    categories: ["Website"],
    description:
      "The official website of a constructions company based in Ghana",
    image: ["/assets/projects/pc-ltd.png"],
    tags: ["Next.js", "Typescript", "Tailwind CSS"],
    github: "https://github.com/ZiglaCity/prosper-constructions-ltd",
    demo: "https://prosper-constructions-ltd.vercel.app/",
    featured: true,
  },
  {
    id: 11,
    title: "Neural Task Manager",
    categories: ["AI/ML", "WIP"],
    description:
      "Intelligent task management system that learns from user behavior to optimize productivity and suggest task prioritization.",
    tags: ["Python", "TensorFlow", "React", "PostgreSQL"],
    github: "#",
    demo: "#",
    featured: false,
  },
];

export const categories = [
  "All",
  "CyberOps",
  "Security Tools",
  "AI/ML",
  "Full-Stack",
  "DevOps",
  "Desktop App",
  "Chrome Extension",
  "Messaging / Security",
  "WIP",
  "Website",
];
