"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TAG_BLOCKLIST = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function NavShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (TAG_BLOCKLIST.has(target.tagName) || target.isContentEditable) return;

      switch (e.key) {
        case "1":
          router.push("/dashboard");
          break;
        case "2":
          router.push("/applications");
          break;
        case "3":
          router.push("/settings");
          break;
        case "n":
        case "N":
          router.push("/applications/new");
          break;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
