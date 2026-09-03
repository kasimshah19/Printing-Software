"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function GlobalHotkeys() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Hotkey Mappings
      switch (e.key) {
        case "F1":
          e.preventDefault();
          router.push("/editor?template=passport-photo");
          break;
        case "F2":
          e.preventDefault();
          router.push("/editor?template=generic-id");
          break;
        case "F3":
          e.preventDefault();
          router.push("/editor?template=passport-a4-35"); // Map to an A4 photo sheet preset
          break;
        case "F4":
          e.preventDefault();
          router.push("/editor?template=aadhaar-letter");
          break;
        case "F5":
          // Usually F5 is refresh. Only override if explicitly asked, but spec says "F5 -> New Job".
          if (e.ctrlKey || e.metaKey) return; // allow hard refresh
          e.preventDefault();
          router.push("/jobs");
          break;
        case "F6":
          e.preventDefault();
          router.push("/customers"); // Or global search
          break;
        case "F9":
          if (pathname === "/editor") {
            e.preventDefault();
            router.push("/print");
          }
          break;
        case "F10":
          if (pathname === "/print") {
            e.preventDefault();
            window.print();
          }
          break;
        case "p":
        case "P":
          if (e.ctrlKey || e.metaKey) {
            // If in editor, route to print preview, otherwise let browser print
            if (pathname === "/editor") {
              e.preventDefault();
              router.push("/print");
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return null;
}
