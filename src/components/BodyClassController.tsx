"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FONT_CLASSES = [
  "--font-poppins",
  "--font-montserrat",
  "--font-rubik",
  "--font-rethink-sans"
];

export default function BodyClassController() {
  const pathname = usePathname();

  useEffect(() => {
    // Get all font variable classes from the HTML element
    const html = document.documentElement;
    const fontVars = Array.from(html.classList).filter(cls =>
      FONT_CLASSES.some(fv => cls.includes(fv))
    );

    // Always apply font variables to body
    document.body.className = fontVars.join(" ");

    // Add single-page class for matches/leaderboard
    const isSinglePage = ["/matches", "/leaderboard"].some(
      path => pathname === path || pathname.startsWith(`${path}/`)
    );
    if (isSinglePage) {
      document.body.classList.add("single-page");
    }

    // Add single-match class for my-account and its subpages
    const isSingleMatch = pathname === "/my-account" || pathname.startsWith("/my-account/");
    if (isSingleMatch) {
      document.body.classList.add("single-match");
    }
  }, [pathname]);

  return null;
}
