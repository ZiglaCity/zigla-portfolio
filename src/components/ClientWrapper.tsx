"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FloatingNav from "@@/components/ui/FloatingNav";
import TerminalOverlay from "@@/components/ui/TerminalOverlay";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [terminalOpen, setTerminalOpen] = useState(false);

  const isHome = pathname === "/";

  // Define nav array for index matching
  const navItems = isHome
    ? ["Home", "About", "Skills", "Experience", "Projects", "Blogs", "Contact"]
    : ["Home", "Projects", "Blogs", "Contact"];

  let activeIndex = navItems.indexOf(
    isHome
      ? "Home"
      : pathname === "/projects"
      ? "Projects"
      : pathname === "/blogs"
      ? "Blogs"
      : pathname === "/contact"
      ? "Contact"
      : "Home"
  );

  const handleNavigate = (i: number) => {
    if (isHome && i < 4) {
      const sectionIds = ["hero", "about", "skills", "experience"];
      const el = document.getElementById(sectionIds[i]);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      const pageRoutes = isHome
        ? ["/projects", "/blogs", "/contact"]
        : ["/", "/projects", "/blogs", "/contact"];
      const pageIndex = isHome ? i - 4 : i; // Adjust for home sections
      router.push(pageRoutes[pageIndex]);
    }
  };

  return (
    <>
      <FloatingNav
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
        onEnterTerminal={() => setTerminalOpen(true)}
        isHome={isHome}
      />
      <TerminalOverlay
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />
      {children}
    </>
  );
}
