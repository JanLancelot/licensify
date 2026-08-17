"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/context/ToastContext";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Upload,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";



export default function MaterialsPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const materials = useQuery(api.materials.listAllMaterialsAdmin, {});
  const { success, error: showError } = useToast();

  const createMaterial = useMutation(api.materials.createMaterial);
  const updateMaterial = useMutation(api.materials.updateMaterial);
  const deleteMaterial = useMutation(api.materials.deleteMaterial);
  const generateUploadUrl = useMutation(api.materials.generateUploadUrl);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState<Id<"subjects"> | "">("");
  const [formTopicId, setFormTopicId] = useState<Id<"topics"> | "">("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"article" | "pdf" | "image" | "document">("article");
  const [formContent, setFormContent] = useState("");
  const [formStorageId, setFormStorageId] = useState<Id<"_storage"> | undefined>(undefined);
  const [formPublished, setFormPublished] = useState(true);
  const [previewMode, setPreviewMode] = useState<"write" | "preview" | "split">("split");

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: Id<"materials">; title: string } | null>(null);

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormSubjectId((subjects && subjects[0]?._id) || "");
    setFormTopicId("");
    setFormTitle("");
    setFormDescription("");
    setFormType("article");
    setFormContent("# Architecture Review Notes\n\n### Key Concepts & Building Codes\n- Item 1\n- Item 2\n\n```\nMinimum clear width = 1200mm\n```");
    setFormStorageId(undefined);
    setFormPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditingMaterial(m);
    setFormSubjectId(m.subjectId);
    setFormTopicId(m.topicId || "");
    setFormTitle(m.title);
    setFormDescription(m.description || "");
    setFormType(m.type);
    setFormContent(m.content || "");
    setFormStorageId(m.storageId);
    setFormPublished(m.isPublished);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 2. POST file to Convex Storage
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = await res.json();
      setFormStorageId(json.storageId);
      success(`File "${file.name}" uploaded successfully!`);
    } catch (err: any) {
      showError(err?.message || "Failed to upload file to storage.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubjectId) return;

    setSaving(true);
    try {
      if (editingMaterial) {
        await updateMaterial({
          materialId: editingMaterial._id,
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          type: formType,
          content: formContent.trim() || undefined,
          storageId: formStorageId,
          isPublished: formPublished,
        });
        success("Study material updated.");
      } else {
        await createMaterial({
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          type: formType,
          content: formContent.trim() || undefined,
          storageId: formStorageId,
          isPublished: formPublished,
        });
        success("Study note published.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save material.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await deleteMaterial({ materialId: deleteConfirm.id });
      success("Study material deleted.");
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete material.");
    } finally {
      setSaving(false);
    }
  };

  if (materials === undefined || subjects === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading study materials...</p>
        </div>
      </div>
    );
  }

  const filteredMaterials = materials.filter((m: any) => {
    if (selectedSubject !== "all" && m.subjectId !== selectedSubject) return false;
    if (selectedType !== "all" && m.type !== selectedType) return false;
    return true;
  });

  const availableTopicsForForm = topics.filter((t: any) => t.subjectId === formSubjectId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Study Notes & Documents
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Author rich markdown review notes, architectural reference articles, and upload PDF syllabus attachments.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blueprint-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Note</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-studio-500">
            <Filter className="w-4 h-4" />
            <span>Filter by:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Board Subjects ({materials.length})</option>
            {subjects.map((s: any) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Formats</option>
            <option value="article">Markdown Article</option>
            <option value="pdf">PDF Document</option>
            <option value="image">Diagram / Image</option>
            <option value="document">Reference Doc</option>
          </select>
        </div>

        <span className="text-xs text-studio-500">
          Showing <strong className="text-studio-800 dark:text-studio-200">{filteredMaterials.length}</strong> items
        </span>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border">
          <BookOpen className="w-12 h-12 text-studio-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-studio-900 dark:text-studio-100">
            No Study Materials Found
          </h3>
          <p className="text-xs text-studio-500 mt-1 mb-4">
            Start writing notes or uploading syllabus documents for candidates.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
          >
            Create First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMaterials.map((mat: any) => {
            const subj = subjects.find((s: any) => s._id === mat.subjectId);
            const top = topics.find((t: any) => t._id === mat.topicId);

            return (
              <div
                key={mat._id}
                className="glass-panel rounded-2xl border p-5 flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 border border-blueprint-500/20">
                        {mat.type}
                      </span>
                      {mat.isPublished ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-studio-500/10 text-studio-500 border border-studio-500/20">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(mat)}
                        title="Edit note"
                        className="p-1 rounded text-studio-400 hover:text-studio-700 dark:hover:text-studio-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: mat._id, title: mat.title })}
                        title="Delete note"
                        className="p-1 rounded text-studio-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-studio-900 dark:text-studio-50 line-clamp-1">
                    {mat.title}
                  </h3>
                  {mat.description && (
                    <p className="text-xs text-studio-500 line-clamp-2 mt-1">
                      {mat.description}
                    </p>
                  )}

                  <div className="mt-3 text-[11px] text-studio-400 space-y-0.5">
                    <p>Subject: <strong className="text-studio-600 dark:text-studio-300">{subj?.name || "General"}</strong></p>
                    {top && <p>Topic: <span className="text-studio-500">{top.name}</span></p>}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-studio-200/60 dark:border-studio-800/60 flex items-center justify-between text-xs">
                  {mat.fileUrl ? (
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blueprint-600 dark:text-blueprint-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Download File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-studio-400 font-mono text-[11px]">
                      {mat.content ? `${mat.content.length} characters` : "Empty note"}
                    </span>
                  )}
                  <span className="text-studio-400 text-[11px]">
                    {new Date(mat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Material Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMaterial ? "Edit Study Material" : "Author Study Note / Reference"}
        description="Compose markdown articles or attach reference documents."
        icon={<BookOpen className="w-5 h-5" />}
        maxWidth="3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="material-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingMaterial ? "Save Changes" : "Publish Article"}</span>
            </button>
          </>
        }
      >
        <form id="material-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Board Exam Subject
              </label>
              <select
                value={formSubjectId}
                onChange={(e) => {
                  setFormSubjectId(e.target.value as Id<"subjects">);
                  setFormTopicId("");
                }}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                {subjects.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Syllabus Topic (Optional)
              </label>
              <select
                value={formTopicId}
                onChange={(e) => setFormTopicId(e.target.value as Id<"topics">)}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="">-- General / Subject Level --</option>
                {availableTopicsForForm.map((t: any) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Article Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., National Building Code (PD 1096) Rule VII & VIII Summary"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Format Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="article">Markdown Article</option>
                <option value="pdf">PDF Document</option>
                <option value="image">Architectural Diagram</option>
                <option value="document">External Syllabus Doc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setFormPublished(!formPublished)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  formPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border-studio-300 dark:border-studio-700"
                }`}
              >
                {formPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{formPublished ? "Live" : "Draft"}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                File Attachment (PDF / Img)
              </label>
              <label className="w-full py-2.5 px-3 rounded-xl bg-studio-100 dark:bg-studio-800 border border-dashed border-studio-300 dark:border-studio-700 hover:border-blueprint-500 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {uploadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blueprint-500" />
                ) : (
                  <Upload className="w-4 h-4 text-studio-400" />
                )}
                <span className="truncate">
                  {formStorageId ? "File Attached ✓" : "Upload File"}
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
              </label>
            </div>
          </div>

          {/* Markdown Editor Pane */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider">
                Markdown Note Content
              </label>
              <div className="flex items-center gap-1 bg-studio-100 dark:bg-studio-800 p-1 rounded-lg border border-studio-200 dark:border-studio-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode("write")}
                  className={`px-2 py-0.5 rounded ${previewMode === "write" ? "bg-blueprint-600 text-white font-semibold" : "text-studio-500"}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("split")}
                  className={`px-2 py-0.5 rounded ${previewMode === "split" ? "bg-blueprint-600 text-white font-semibold" : "text-studio-500"}`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("preview")}
                  className={`px-2 py-0.5 rounded ${previewMode === "preview" ? "bg-blueprint-600 text-white font-semibold" : "text-studio-500"}`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(previewMode === "write" || previewMode === "split") && (
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="# Markdown Title&#10;&#10;Write comprehensive study materials here..."
                  rows={8}
                  className={`w-full p-4 font-mono text-xs rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 focus:outline-none focus:ring-2 focus:ring-blueprint-500 ${previewMode === "write" ? "md:col-span-2" : ""}`}
                />
              )}

              {(previewMode === "preview" || previewMode === "split") && (
                <div
                  className={`p-4 rounded-xl bg-studio-50 dark:bg-studio-900 border border-studio-200 dark:border-studio-700 overflow-y-auto max-h-56 text-xs prose dark:prose-invert prose-headings:font-bold prose-headings:text-studio-900 dark:prose-headings:text-studio-100 ${previewMode === "preview" ? "md:col-span-2" : ""}`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {formContent || <span className="text-studio-400 italic">Preview will appear here...</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Study Note"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm disabled:opacity-60"
            >
              {saving ? "Deleting..." : "Delete Permanently"}
            </button>
          </>
        }
      >
        {deleteConfirm && (
          <p className="text-sm text-studio-600 dark:text-studio-400">
            Are you sure you want to permanently delete <strong className="text-studio-900 dark:text-studio-100">&quot;{deleteConfirm.title}&quot;</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}
