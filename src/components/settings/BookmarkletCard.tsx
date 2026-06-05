"use client";

import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, GripVertical, Check } from "lucide-react";

/**
 * Bookmarklet JS that extracts page title + URL and opens the new-application
 * form with those fields pre-filled.
 *
 * The %%ORIGIN%% placeholder is replaced at render time with the current
 * window.location.origin so the bookmarklet always points at the right host.
 */
const BOOKMARKLET_TEMPLATE = `javascript:void(window.open('%%ORIGIN%%/applications/new?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank'))`;

export function BookmarkletCard() {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const bookmarkletHref = BOOKMARKLET_TEMPLATE.replaceAll(
    "%%ORIGIN%%",
    origin,
  );

  function handleCopy() {
    navigator.clipboard.writeText(bookmarkletHref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Bookmarklet</CardTitle>
        <CardDescription>
          Save jobs from any website in one click. Drag the button below to your
          bookmarks bar, then click it on any job posting page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Draggable bookmarklet link */}
        <div className="flex items-center gap-3">
          <a
            ref={linkRef}
            href={bookmarkletHref}
            draggable
            onDragStart={(e) => {
              // Ensure the browser treats this as a bookmark drag
              e.dataTransfer.setData("text/uri-list", bookmarkletHref);
              e.dataTransfer.setData(
                "text/plain",
                "Save to Job Tracker",
              );
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-100 hover:shadow dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/60"
          >
            <GripVertical size={14} className="text-indigo-400" />
            Save to Job Tracker
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check size={12} /> Copied
              </>
            ) : (
              "Copy link"
            )}
          </Button>
        </div>

        {/* Instructions */}
        <ol className="list-inside list-decimal space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <li>
            Drag the <strong className="text-zinc-700 dark:text-zinc-300">Save to Job Tracker</strong>{" "}
            button above into your browser&apos;s bookmarks bar
          </li>
          <li>
            Navigate to any job posting (LinkedIn, Indeed, company career pages…)
          </li>
          <li>
            Click the bookmarklet — it opens a new application pre-filled with
            the page URL and title
          </li>
          <li>Review the details and save</li>
        </ol>

        <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <ExternalLink size={11} />
          Works on any website. The page URL and title are used to pre-fill the
          company and role fields.
        </p>
      </CardContent>
    </Card>
  );
}
