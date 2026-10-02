"use client";

import React, { useState } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Megaphone, Plus, Eye, Loader2 } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";

type Announcement = Doc<"announcements">;
const fieldClass = "w-full rounded-lg border border-studio-200 dark:border-studio-700 bg-studio-50 dark:bg-studio-800 px-3 py-2.5 text-sm";
const secondaryClass = "rounded-lg border border-studio-200 dark:border-studio-700 px-3 py-2 text-sm font-medium hover:bg-studio-100 dark:hover:bg-studio-800 disabled:opacity-50";

function AnnouncementPreview({ title, body }: { title: string; body: string }) {
  return (
    <section aria-label="Announcement preview" className="rounded-xl border border-studio-200 dark:border-studio-700 p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">What’s New</p>
      <h3 className="text-lg font-semibold break-words">{title.trim() || "Announcement title"}</h3>
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-studio-600 dark:text-studio-300">{body.trim() || "Your message will appear here."}</p>
    </section>
  );
}

export default function AnnouncementsPage() {
  const { results, status, loadMore } = usePaginatedQuery(api.announcements.listAdmin, {}, { initialNumItems: 20 });
  const saveDraft = useMutation(api.announcements.saveDraft);
  const setStatus = useMutation(api.announcements.setStatus);
  const toast = useToast();
  const [editor, setEditor] = useState<{ original: Announcement | null; title: string; body: string } | null>(null);
  const [preview, setPreview] = useState<Announcement | null>(null);
  const [editorPreview, setEditorPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const openEditor = (row: Announcement | null) => {
    setError(""); setEditorPreview(false);
    setEditor({ original: row, title: row?.title ?? "", body: row?.body ?? "" });
  };
  const run = async (operation: () => Promise<unknown>, message: string) => {
    if (pending) return;
    setPending(true); setError("");
    try {
      await operation();
      setEditor(null); setPreview(null);
      toast.success(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save. Please try again.");
    } finally { setPending(false); }
  };
  const changeStatus = (row: Announcement, next: Announcement["status"]) => run(
    () => setStatus({ id: row._id, expectedUpdatedAt: row.updatedAt, status: next }),
    next === "published" ? "Announcement published." : next === "draft" ? "Announcement moved to drafts." : "Announcement archived.",
  );
  const valid = !!editor?.title.trim() && !!editor?.body.trim() && editor.title.trim().length <= 120 && editor.body.trim().length <= 5000;
  const errorAlert = error ? <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Announcements</h2>
          <p className="mt-1 text-sm text-studio-500 dark:text-studio-400">Manage updates for the What’s New section on Home.</p>
        </div>
        <button className="btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2" onClick={() => openEditor(null)} disabled={pending}>
          <Plus className="h-4 w-4" /> Create announcement
        </button>
      </div>
      {!editor && !preview && errorAlert}
      {status === "LoadingFirstPage" ? (
        <div role="status" className="flex items-center justify-center gap-2 py-16 text-studio-500 dark:text-studio-400"><Loader2 className="h-5 w-5 animate-spin" />Loading announcements…</div>
      ) : results.length === 0 ? (
        <div className="surface-panel rounded-xl p-10 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-brand-600 dark:text-brand-400 mb-4" />
          <h3 className="font-semibold">No announcements yet</h3>
          <p className="mt-2 text-sm text-studio-500 dark:text-studio-400">Create a draft when you’re ready. Nothing appears to students until you publish it.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(row => (
            <article key={row._id} className="surface-panel rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold break-words min-w-0">{row.title}</h3>
                  <span className={`rounded px-2 py-0.5 text-xs capitalize ${row.status === "published" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-studio-100 dark:bg-studio-800 text-studio-600 dark:text-studio-300"}`}>{row.status}</span>
                </div>
                <p className="text-sm text-studio-500 dark:text-studio-400 line-clamp-2 break-words whitespace-pre-wrap">{row.body}</p>
                <p className="text-xs text-studio-500 dark:text-studio-400">Updated {new Date(row.updatedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button className={secondaryClass} disabled={pending} onClick={() => { setError(""); setPreview(row); }}>Preview</button>
                {row.status === "published" ? (
                  <button className={secondaryClass} disabled={pending} onClick={() => changeStatus(row, "draft")}>Unpublish</button>
                ) : <>
                  <button className={secondaryClass} disabled={pending} onClick={() => openEditor(row)}>{row.status === "archived" ? "Restore & edit" : "Edit"}</button>
                  {row.status === "draft" && <>
                    <button className={secondaryClass} disabled={pending} onClick={() => changeStatus(row, "archived")}>Archive</button>
                    <button className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold" disabled={pending} onClick={() => { setError(""); setPreview(row); }}>Publish</button>
                  </>}
                </>}
              </div>
            </article>
          ))}
          {status !== "Exhausted" && <button className={secondaryClass} disabled={status === "LoadingMore"} onClick={() => loadMore(20)}>{status === "LoadingMore" ? "Loading…" : "Load more"}</button>}
        </div>
      )}
      <Modal isOpen={!!editor} onClose={() => { if (!pending) setEditor(null); }} title={editor?.original ? "Edit announcement" : "Create announcement"} description="Save a draft first, then preview and publish when it is ready." icon={<Megaphone className="h-5 w-5" />} footer={<div className="flex flex-wrap justify-end gap-2">
        <button className={secondaryClass} disabled={pending} onClick={() => setEditor(null)}>Cancel</button>
        <button className={secondaryClass} disabled={pending} onClick={() => setEditorPreview(!editorPreview)}>{editorPreview ? "Back to editor" : "Preview"}</button>
        <button type="submit" form="announcement-editor" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" disabled={pending || !valid}>{pending ? "Saving…" : "Save Draft"}</button>
      </div>}>
        {errorAlert}
        {editor && <form id="announcement-editor" onSubmit={event => {
          event.preventDefault();
          if (!valid) return;
          void run(() => saveDraft({ id: editor.original?._id, expectedUpdatedAt: editor.original?.updatedAt, title: editor.title, body: editor.body }), "Draft saved. It is not visible to students.");
        }} className="space-y-5">
          {editorPreview ? <AnnouncementPreview title={editor.title} body={editor.body} /> : <>
            <div className="space-y-2">
              <label htmlFor="announcement-title" className="block text-sm font-semibold">Title</label>
              <input id="announcement-title" autoFocus required maxLength={120} className={fieldClass} value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} disabled={pending} />
              <p className="text-xs text-studio-500 dark:text-studio-400">{editor.title.length}/120 characters</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="announcement-body" className="block text-sm font-semibold">Message</label>
              <textarea id="announcement-body" required maxLength={5000} rows={8} className={fieldClass} value={editor.body} onChange={e => setEditor({ ...editor, body: e.target.value })} disabled={pending} />
              <p className="text-xs text-studio-500 dark:text-studio-400">Plain text · {editor.body.length}/5,000 characters</p>
            </div>
          </>}
        </form>}
      </Modal>
      <Modal isOpen={!!preview} onClose={() => { if (!pending) setPreview(null); }} title="Preview announcement" icon={<Eye className="h-5 w-5" />} footer={<div className="flex flex-wrap gap-2">
        <button className={secondaryClass} disabled={pending} onClick={() => setPreview(null)}>Close</button>
        {preview?.status === "draft" && <button className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" disabled={pending} onClick={() => changeStatus(preview, "published")}>{pending ? "Publishing…" : "Publish announcement"}</button>}
      </div>}>
        {errorAlert}
        {preview && <>
          <p className="text-sm text-studio-500 dark:text-studio-400">{preview.status === "draft" ? "Publishing makes this announcement available to all signed-in app users." : preview.status === "published" ? "This announcement is published. Unpublish it before editing." : "This announcement is archived and hidden from students."}</p>
          <AnnouncementPreview title={preview.title} body={preview.body} />
        </>}
      </Modal>
    </div>
  );
}
