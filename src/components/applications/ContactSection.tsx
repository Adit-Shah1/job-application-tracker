"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateContactInfo } from "@/lib/actions/resumes";
import { useToast } from "@/components/ui/toast";
import { Pencil, X, Check, User, Mail, Phone } from "lucide-react";

export function ContactSection({
  applicationId,
  contactName: initialName,
  contactEmail: initialEmail,
  contactPhone: initialPhone,
}: {
  applicationId: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [contactName, setContactName] = useState(initialName ?? "");
  const [contactEmail, setContactEmail] = useState(initialEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initialPhone ?? "");
  const { toast } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateContactInfo(applicationId, formData);
      if (res.ok) {
        setContactName(String(formData.get("contactName") ?? ""));
        setContactEmail(String(formData.get("contactEmail") ?? ""));
        setContactPhone(String(formData.get("contactPhone") ?? ""));
        setEditing(false);
        toast({ title: "Contact updated" });
      } else {
        toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
      }
    });
  }

  if (!editing) {
    const hasContact = contactName || contactEmail || contactPhone;
    if (!hasContact) {
      return (
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
          <Pencil size={13} /> Add contact
        </Button>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Contact</span>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-6 px-1.5">
            <Pencil size={12} />
          </Button>
        </div>
        {contactName && (
          <div className="flex items-center gap-2 text-sm">
            <User size={13} className="text-zinc-400" />
            <span>{contactName}</span>
          </div>
        )}
        {contactEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={13} className="text-zinc-400" />
            <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
              {contactEmail}
            </a>
          </div>
        )}
        {contactPhone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={13} className="text-zinc-400" />
            <a href={`tel:${contactPhone}`} className="text-blue-600 hover:underline">
              {contactPhone}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Contact</span>
        <button type="button" onClick={() => setEditing(false)} className="text-zinc-400 hover:text-zinc-600">
          <X size={14} />
        </button>
      </div>
      <Input name="contactName" defaultValue={contactName} placeholder="Name" />
      <Input name="contactEmail" type="email" defaultValue={contactEmail} placeholder="email@company.com" />
      <Input name="contactPhone" type="tel" defaultValue={contactPhone} placeholder="+1 (555) 000-0000" />
      <input type="hidden" name="coverLetter" value="" />
      <input type="hidden" name="resumeVersionId" value="" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          <X size={14} /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          <Check size={14} /> {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
