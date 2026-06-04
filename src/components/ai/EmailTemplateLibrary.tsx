"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, FileText, Send, Heart, XCircle, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Template = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  body: string;
};

const TEMPLATES: Template[] = [
  {
    id: "follow-up",
    name: "Follow Up",
    icon: <Send size={14} />,
    description: "Check in after applying or interviewing",
    body: `Hi {{contactName}},

I hope you're doing well. I wanted to follow up on my application for the {{role}} position at {{company}}. I'm very excited about this opportunity and believe my experience would be a strong fit for the team.

Please let me know if there's any additional information I can provide. I'd love the chance to discuss how I can contribute.

Best regards`,
  },
  {
    id: "thank-you",
    name: "Thank You",
    icon: <Heart size={14} />,
    description: "Thank the interviewer after a conversation",
    body: `Hi {{contactName}},

Thank you for taking the time to speak with me about the {{role}} position at {{company}}. I really enjoyed learning more about the team and the role.

Our conversation reinforced my enthusiasm for this opportunity. I'm confident that my background would allow me to make meaningful contributions from day one.

Please don't hesitate to reach out if you have any further questions. I look forward to hearing from you.

Best regards`,
  },
  {
    id: "withdrawal",
    name: "Withdrawal",
    icon: <XCircle size={14} />,
    description: "Gracefully withdraw your application",
    body: `Hi {{contactName}},

Thank you for considering me for the {{role}} position at {{company}}. After careful consideration, I've decided to withdraw my application at this time.

I appreciate the time you and the team have invested in the process, and I hope we can stay in touch for potential opportunities in the future.

Best regards`,
  },
  {
    id: "recruiter-outreach",
    name: "Outreach",
    icon: <UserPlus size={14} />,
    description: "Reach out to a recruiter or hiring manager",
    body: `Hi {{contactName}},

I came across the {{role}} opening at {{company}} and was immediately drawn to the opportunity. With my background in the field, I believe I'd be a strong addition to the team.

I'd love to learn more about the role and share how my experience aligns with what you're looking for. Would you be open to a brief conversation?

Best regards`,
  },
];

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function EmailTemplateLibrary({
  companyName,
  roleTitle,
  contactName,
}: {
  companyName: string;
  roleTitle: string;
  contactName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [customized, setCustomized] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  function selectTemplate(t: Template) {
    setSelected(t);
    const filled = interpolate(t.body, {
      company: companyName,
      role: roleTitle,
      contactName: contactName || "there",
    });
    setCustomized(filled);
    setCopied(false);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(customized);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <FileText size={13} /> Templates
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelected(null); setCustomized(""); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-zinc-500" />
              Email Templates
            </DialogTitle>
            <DialogDescription>
              {companyName} — {roleTitle}
            </DialogDescription>
          </DialogHeader>

          {!selected ? (
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTemplate(t)}
                  className="group flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 text-left transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <span className="text-zinc-500">{t.icon}</span>
                    {t.name}
                  </div>
                  <p className="text-xs text-zinc-500">{t.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ← Back to templates
                </button>
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {selected.name}
                </span>
              </div>
              <Textarea
                value={customized}
                onChange={(e) => setCustomized(e.target.value)}
                rows={12}
                className="resize-y"
              />
            </>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setOpen(false); setSelected(null); }}>
              Close
            </Button>
            {selected && (
              <Button onClick={copyToClipboard} disabled={!customized.trim()}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy to clipboard"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
