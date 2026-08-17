"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/context/ToastContext";
import {
  GalleryVerticalEnd,
  Plus,
  Edit2,
  Trash2,
  RotateCw,
  Loader2,
  Eye,
  EyeOff,
  Filter,
  Upload,
} from "lucide-react";


export default function FlashcardsPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const flashcards = useQuery(api.flashcards.listAllFlashcardsAdmin, {});
  const { success, error: showError } = useToast();

  const createFlashcard = useMutation(api.flashcards.createFlashcard);
  const updateFlashcard = useMutation(api.flashcards.updateFlashcard);
  const deleteFlashcard = useMutation(api.flashcards.deleteFlashcard);
  const generateUploadUrl = useMutation(api.materials.generateUploadUrl);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Flip State for Previewing
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState<Id<"subjects"> | "">("");
  const [formTopicId, setFormTopicId] = useState<Id<"topics"> | "">("");
  const [formFront, setFormFront] = useState("");
  const [formBack, setFormBack] = useState("");
  const [formImageId, setFormImageId] = useState<Id<"_storage"> | undefined>(undefined);
  const [formPublished, setFormPublished] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: Id<"flashcards">; front: string } | null>(null);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setFormSubjectId((subjects && subjects[0]?._id) || "");
    setFormTopicId("");
    setFormFront("");
    setFormBack("");
    setFormImageId(undefined);
    setFormPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (card: any) => {
    setEditingCard(card);
    setFormSubjectId(card.subjectId);
    setFormTopicId(card.topicId || "");
    setFormFront(card.front);
    setFormBack(card.back);
    setFormImageId(card.imageId);
    setFormPublished(card.isPublished);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const postUrl = await generateUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = await res.json();
      setFormImageId(json.storageId);
      success("Diagram image attached to flashcard.");
    } catch (err: any) {
      showError(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFront.trim() || !formBack.trim() || !formSubjectId) return;

    setSaving(true);
    try {
      if (editingCard) {
        await updateFlashcard({
          flashcardId: editingCard._id,
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          front: formFront.trim(),
          back: formBack.trim(),
          imageId: formImageId,
          isPublished: formPublished,
        });
        success("Flashcard updated.");
      } else {
        await createFlashcard({
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          front: formFront.trim(),
          back: formBack.trim(),
          imageId: formImageId,
          isPublished: formPublished,
        });
        success("New Flashcard added to deck.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save flashcard.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await deleteFlashcard({ flashcardId: deleteConfirm.id });
      success("Flashcard deleted.");
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete flashcard.");
    } finally {
      setSaving(false);
    }
  };

  if (flashcards === undefined || subjects === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading flashcard studio...</p>
        </div>
      </div>
    );
  }

  const filteredCards = flashcards.filter((c) => {
    if (selectedSubject !== "all" && c.subjectId !== selectedSubject) return false;
    if (selectedTopic !== "all" && c.topicId !== selectedTopic) return false;
    return true;
  });

  const availableTopics = selectedSubject !== "all" ? topics.filter((t) => t.subjectId === selectedSubject) : topics;
  const availableTopicsForForm = topics.filter((t) => t.subjectId === formSubjectId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Flashcards Studio
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Design active-recall flashcard decks for rapid memorization of architectural standards, building laws, and history.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blueprint-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Flashcard</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-studio-500">
            <Filter className="w-4 h-4" />
            <span>Deck:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic("all");
            }}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Board Subjects ({flashcards.length})</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {availableTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            >
              <option value="all">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-xs text-studio-500">
          Showing <strong className="text-studio-800 dark:text-studio-200">{filteredCards.length}</strong> flashcards
        </span>
      </div>

      {/* Interactive 3D Flashcards Grid */}
      {filteredCards.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border">
          <GalleryVerticalEnd className="w-12 h-12 text-studio-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-studio-900 dark:text-studio-100">
            No Flashcards in this Deck
          </h3>
          <p className="text-xs text-studio-500 mt-1 mb-4">
            Build active-recall decks to help examinees drill essential terms and formulas.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
          >
            Create Flashcard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const isFlipped = !!flippedCards[card._id];
            const subj = subjects.find((s) => s._id === card.subjectId);
            const top = topics.find((t) => t._id === card.topicId);

            return (
              <div key={card._id} className="flex flex-col perspective-1000">
                {/* 3D Flip Card Container */}
                <div
                  onClick={() => toggleFlip(card._id)}
                  className={`relative w-full h-64 rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full p-6 glass-panel rounded-3xl border border-studio-200 dark:border-studio-800 backface-hidden flex flex-col justify-between shadow-card hover:shadow-glow transition-shadow">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blueprint-600 dark:text-blueprint-400 px-2 py-0.5 rounded bg-blueprint-500/10 border border-blueprint-500/20">
                          Prompt / Front
                        </span>
                        {card.isPublished ? (
                          <span className="text-[10px] font-semibold text-emerald-500">Live</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-studio-400">Draft</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-studio-900 dark:text-studio-50 leading-snug">
                        {card.front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-studio-400 pt-3 border-t border-studio-200/60 dark:border-studio-800/60">
                      <span className="truncate max-w-[160px]">{subj?.name}</span>
                      <span className="flex items-center gap-1 text-blueprint-500 font-semibold">
                        <RotateCw className="w-3 h-3" /> Flip Card
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full p-6 glass-panel rounded-3xl border border-blueprint-500/30 bg-blueprint-50/40 dark:bg-blueprint-950/30 backface-hidden rotate-y-180 flex flex-col justify-between shadow-glow">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Answer / Back
                        </span>
                        <span className="text-[10px] text-studio-400">ALE Key</span>
                      </div>
                      <p className="text-sm font-medium text-studio-900 dark:text-studio-50 leading-snug">
                        {card.back}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-studio-400 pt-3 border-t border-studio-200/60 dark:border-studio-800/60">
                      <span className="truncate max-w-[160px]">{top?.name || "General"}</span>
                      <span className="flex items-center gap-1 text-blueprint-500 font-semibold">
                        <RotateCw className="w-3 h-3" /> Flip Back
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between px-3 pt-2 text-xs">
                  <span className="text-[11px] text-studio-400">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(card)}
                      className="p-1.5 rounded-lg text-studio-400 hover:text-studio-900 dark:hover:text-studio-100 hover:bg-studio-100 dark:hover:bg-studio-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: card._id, front: card.front })}
                      className="p-1.5 rounded-lg text-studio-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Flashcard Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-modal max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-studio-200 dark:border-studio-800 pb-4">
              <h3 className="font-bold text-lg text-studio-900 dark:text-studio-50">
                {editingCard ? "Edit Flashcard" : "New Flashcard"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-studio-400 hover:text-studio-600 dark:hover:text-studio-200 text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                    Topic Tag (Optional)
                  </label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value as Id<"topics">)}
                    className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
                  >
                    <option value="">-- General / Subject Level --</option>
                    {availableTopicsForForm.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                  Front Side (Prompt / Question / Term)
                </label>
                <textarea
                  value={formFront}
                  onChange={(e) => setFormFront(e.target.value)}
                  placeholder="e.g., Minimum width of a ramp for accessible access under BP 344?"
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                  Back Side (Answer / Code Requirement / Key Details)
                </label>
                <textarea
                  value={formBack}
                  onChange={(e) => setFormBack(e.target.value)}
                  placeholder="e.g., 1200 mm clear width with 1:12 maximum gradient slope."
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Attach Diagram (Optional)
                  </label>
                  <label className="w-full py-2.5 px-3 rounded-xl bg-studio-100 dark:bg-studio-800 border border-dashed border-studio-300 dark:border-studio-700 hover:border-blueprint-500 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blueprint-500" />
                    ) : (
                      <Upload className="w-4 h-4 text-studio-400" />
                    )}
                    <span className="truncate">
                      {formImageId ? "Image Attached ✓" : "Upload Diagram"}
                    </span>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-studio-200 dark:border-studio-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCard ? "Save Changes" : "Create Flashcard"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-rose-500/20">
            <h3 className="font-bold text-lg text-studio-900 dark:text-studio-50">
              Delete Flashcard
            </h3>
            <p className="text-sm text-studio-600 dark:text-studio-400">
              Are you sure you want to remove this flashcard (<strong className="text-studio-900 dark:text-studio-100">&quot;{deleteConfirm.front.slice(0, 50)}...&quot;</strong>)?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-studio-200 dark:border-studio-800">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm disabled:opacity-60"
              >
                {saving ? "Deleting..." : "Delete Flashcard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
