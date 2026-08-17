"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/context/ToastContext";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";



export default function CurriculumPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const { success, error: showError } = useToast();

  const createSubject = useMutation(api.subjects.createSubject);
  const updateSubject = useMutation(api.subjects.updateSubject);
  const deleteSubject = useMutation(api.subjects.deleteSubject);

  const createTopic = useMutation(api.topics.createTopic);
  const updateTopic = useMutation(api.topics.updateTopic);
  const deleteTopic = useMutation(api.topics.deleteTopic);

  // UI state
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{
    _id: Id<"subjects">;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<{

    _id: Id<"topics">;
    subjectId: Id<"subjects">;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "subject" | "topic";
    id: string;
    name: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  // Subject Form State
  const [subjName, setSubjName] = useState("");
  const [subjDesc, setSubjDesc] = useState("");
  const [subjOrder, setSubjOrder] = useState(1);
  const [subjPublished, setSubjPublished] = useState(true);

  // Topic Form State
  const [topSubjectId, setTopSubjectId] = useState<Id<"subjects"> | "">("");
  const [topName, setTopName] = useState("");
  const [topDesc, setTopDesc] = useState("");
  const [topOrder, setTopOrder] = useState(1);
  const [topPublished, setTopPublished] = useState(true);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateSubject = () => {
    setEditingSubject(null);
    setSubjName("");
    setSubjDesc("");
    setSubjOrder((subjects?.length || 0) + 1);
    setSubjPublished(true);
    setSubjectModalOpen(true);
  };

  const openEditSubject = (s: any) => {
    setEditingSubject(s);
    setSubjName(s.name);
    setSubjDesc(s.description || "");
    setSubjOrder(s.order);
    setSubjPublished(s.isPublished);
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;

    setSaving(true);
    try {
      if (editingSubject) {
        await updateSubject({
          subjectId: editingSubject._id,
          name: subjName.trim(),
          description: subjDesc.trim() || undefined,
          order: Number(subjOrder),
          isPublished: subjPublished,
        });
        success("Subject updated successfully.");
      } else {
        await createSubject({
          name: subjName.trim(),
          description: subjDesc.trim() || undefined,
          order: Number(subjOrder),
          isPublished: subjPublished,
        });
        success("New Subject created.");
      }
      setSubjectModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save subject.");
    } finally {
      setSaving(false);
    }
  };

  const openCreateTopic = (subjectId?: Id<"subjects">) => {
    setEditingTopic(null);
    setTopSubjectId(subjectId || (subjects && subjects[0]?._id) || "");
    setTopName("");
    setTopDesc("");
    setTopOrder(1);
    setTopPublished(true);
    setTopicModalOpen(true);
  };

  const openEditTopic = (t: any) => {
    setEditingTopic(t);
    setTopSubjectId(t.subjectId);
    setTopName(t.name);
    setTopDesc(t.description || "");
    setTopOrder(t.order);
    setTopPublished(t.isPublished);
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topName.trim() || !topSubjectId) return;

    setSaving(true);
    try {
      if (editingTopic) {
        await updateTopic({
          topicId: editingTopic._id,
          name: topName.trim(),
          description: topDesc.trim() || undefined,
          order: Number(topOrder),
          isPublished: topPublished,
        });
        success("Topic updated successfully.");
      } else {
        await createTopic({
          subjectId: topSubjectId as Id<"subjects">,
          name: topName.trim(),
          description: topDesc.trim() || undefined,
          order: Number(topOrder),
          isPublished: topPublished,
        });
        success("New Topic added to syllabus.");
      }
      setTopicModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save topic.");
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;

    setSaving(true);
    try {
      if (deleteConfirm.type === "subject") {
        await deleteSubject({ subjectId: deleteConfirm.id as Id<"subjects"> });
        success("Subject deleted.");
      } else {
        await deleteTopic({ topicId: deleteConfirm.id as Id<"topics"> });
        success("Topic deleted.");
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  if (subjects === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading curriculum hierarchy...</p>
        </div>
      </div>
    );
  }

  const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Curriculum Structure
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Organize Board Exam Subjects and their corresponding syllabus topics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openCreateTopic()}
            className="px-4 py-2.5 rounded-xl bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold flex items-center gap-2 transition-all border border-studio-300/50 dark:border-studio-700/50"
          >
            <Plus className="w-4 h-4 text-blueprint-500" />
            <span>Add Topic</span>
          </button>
          <button
            onClick={openCreateSubject}
            className="px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blueprint-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject Area</span>
          </button>
        </div>
      </div>

      {/* Subjects & Topics Accordion List */}
      <div className="space-y-4">
        {sortedSubjects.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border">
            <Layers className="w-12 h-12 text-studio-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-studio-900 dark:text-studio-100">
              No Curriculum Subjects Found
            </h3>
            <p className="text-xs text-studio-500 mt-1 mb-4">
              Get started by creating your first Architecture Board Exam subject.
            </p>
            <button
              onClick={openCreateSubject}
              className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
            >
              Create Subject
            </button>
          </div>
        ) : (
          sortedSubjects.map((subj) => {
            const isExpanded = expandedSubjects[subj._id] !== false; // expanded by default
            const subjectTopics = topics
              .filter((t) => t.subjectId === subj._id)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={subj._id}
                className="glass-panel rounded-2xl border overflow-hidden transition-all"
              >
                {/* Subject Header Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-studio-100/40 dark:bg-studio-850/40">
                  <div
                    onClick={() => toggleSubject(subj._id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 select-none overflow-hidden"
                  >
                    <button className="p-1 rounded-lg text-studio-400 hover:text-studio-700 dark:hover:text-studio-200">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 flex items-center justify-center font-mono font-bold text-xs">
                      #{subj.order}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-base text-studio-900 dark:text-studio-50 truncate">
                          {subj.name}
                        </h3>
                        {subj.isPublished ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-studio-500/10 text-studio-500 border border-studio-500/20">
                            Draft
                          </span>
                        )}
                      </div>
                      {subj.description && (
                        <p className="text-xs text-studio-500 truncate mt-0.5">
                          {subj.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openCreateTopic(subj._id)}
                      title="Add Topic under this Subject"
                      className="px-2.5 py-1.5 rounded-lg bg-studio-200/80 dark:bg-studio-800 hover:bg-blueprint-600 hover:text-white text-studio-700 dark:text-studio-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Topic</span>
                    </button>
                    <button
                      onClick={() => openEditSubject(subj)}
                      title="Edit Subject"
                      className="p-1.5 rounded-lg text-studio-500 hover:text-studio-900 dark:hover:text-studio-100 hover:bg-studio-200/60 dark:hover:bg-studio-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: "subject",
                          id: subj._id,
                          name: subj.name,
                        })
                      }
                      title="Delete Subject"
                      className="p-1.5 rounded-lg text-studio-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Topics Container */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-studio-200/60 dark:border-studio-800/60 bg-studio-50/50 dark:bg-studio-950/40 space-y-2">
                    {subjectTopics.length === 0 ? (
                      <div className="text-center py-4 text-xs text-studio-400">
                        No topics yet. Click &quot;Add Topic&quot; to subdivide this subject.
                      </div>
                    ) : (

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subjectTopics.map((topic) => (
                          <div
                            key={topic._id}
                            className="p-3.5 rounded-xl bg-white dark:bg-studio-900 border border-studio-200/80 dark:border-studio-800/80 flex items-center justify-between gap-3 shadow-sm hover:border-blueprint-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span className="text-xs font-mono font-semibold text-studio-400">
                                {subj.order}.{topic.order}
                              </span>
                              <div className="truncate">
                                <h4 className="font-semibold text-xs text-studio-900 dark:text-studio-100 truncate">
                                  {topic.name}
                                </h4>
                                {topic.description && (
                                  <p className="text-[11px] text-studio-500 truncate">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openEditTopic(topic)}
                                title="Edit Topic"
                                className="p-1 rounded text-studio-400 hover:text-studio-700 dark:hover:text-studio-200"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "topic",
                                    id: topic._id,
                                    name: topic.name,
                                  })
                                }
                                title="Delete Topic"
                                className="p-1 rounded text-studio-400 hover:text-rose-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Subject Create / Edit Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editingSubject ? "Edit Subject Area" : "New Board Exam Subject"}
        description="Curate PRC Architecture Licensure syllabus area."
        icon={<Layers className="w-5 h-5" />}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSubjectModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="subject-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
            </button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSaveSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              value={subjName}
              onChange={(e) => setSubjName(e.target.value)}
              placeholder="e.g., History of Architecture & Theory of Design"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Description / Syllabus Scope
            </label>
            <textarea
              value={subjDesc}
              onChange={(e) => setSubjDesc(e.target.value)}
              placeholder="Summary of exam syllabus covered in this area..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={subjOrder}
                onChange={(e) => setSubjOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setSubjPublished(!subjPublished)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  subjPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border-studio-300 dark:border-studio-700"
                }`}
              >
                {subjPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{subjPublished ? "Live / Published" : "Draft Only"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Topic Create / Edit Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title={editingTopic ? "Edit Topic" : "New Syllabus Topic"}
        description="Define granular knowledge units and chapters."
        icon={<Layers className="w-5 h-5" />}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setTopicModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="topic-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingTopic ? "Save Changes" : "Create Topic"}</span>
            </button>
          </>
        }
      >
        <form id="topic-form" onSubmit={handleSaveTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Parent Subject Area
            </label>
            <select
              value={topSubjectId}
              onChange={(e) => setTopSubjectId(e.target.value as Id<"subjects">)}
              disabled={!!editingTopic}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            >
              {sortedSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  Area {s.order}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Topic Title
            </label>
            <input
              type="text"
              value={topName}
              onChange={(e) => setTopName(e.target.value)}
              placeholder="e.g., Classical Orders of Architecture"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Description / Key Topics
            </label>
            <textarea
              value={topDesc}
              onChange={(e) => setTopDesc(e.target.value)}
              placeholder="Subtopics, key laws, formulas, or standard codes..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Order Sequencing
              </label>
              <input
                type="number"
                min={1}
                value={topOrder}
                onChange={(e) => setTopOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setTopPublished(!topPublished)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  topPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border-studio-300 dark:border-studio-700"
                }`}
              >
                {topPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{topPublished ? "Live" : "Draft"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
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
              onClick={handleExecuteDelete}
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
            Are you sure you want to delete {deleteConfirm.type} <strong className="text-studio-900 dark:text-studio-100">&quot;{deleteConfirm.name}&quot;</strong>?
            {deleteConfirm.type === "subject" && (
              <span className="block text-xs text-rose-500 mt-2 font-medium">
                Warning: All nested topics under this subject will also be deleted.
              </span>
            )}
          </p>
        )}
      </Modal>
    </div>
  );
}
