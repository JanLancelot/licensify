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
  BookOpen,
  FileText,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function CurriculumPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const branches = useQuery((api as any).branches?.listAllBranchesAdmin, {});
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const lessons = useQuery(api.lessons.listAllLessonsAdmin, {});
  const { success, error: showError } = useToast();

  const createSubject = useMutation(api.subjects.createSubject);
  const updateSubject = useMutation(api.subjects.updateSubject);
  const deleteSubject = useMutation(api.subjects.deleteSubject);

  const createBranch = useMutation((api as any).branches?.createBranch);
  const updateBranch = useMutation((api as any).branches?.updateBranch);
  const deleteBranch = useMutation((api as any).branches?.deleteBranch);

  const createTopic = useMutation(api.topics.createTopic);
  const updateTopic = useMutation(api.topics.updateTopic);
  const deleteTopic = useMutation(api.topics.deleteTopic);

  const createLesson = useMutation(api.lessons.createLesson);
  const updateLesson = useMutation(api.lessons.updateLesson);
  const deleteLesson = useMutation(api.lessons.deleteLesson);

  // UI state
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{
    _id: Id<"subjects">;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<{
    _id: any;
    subjectId: Id<"subjects">;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<{
    _id: Id<"topics">;
    subjectId: Id<"subjects">;
    branchId?: any;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    _id: Id<"lessons">;
    subjectId: Id<"subjects">;
    branchId?: any;
    topicId: Id<"topics">;
    name: string;
    description?: string;
    order: number;
    isPublished: boolean;
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "subject" | "branch" | "topic" | "lesson";
    id: string;
    name: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  // Subject Form State
  const [subjName, setSubjName] = useState("");
  const [subjDesc, setSubjDesc] = useState("");
  const [subjOrder, setSubjOrder] = useState(1);
  const [subjPublished, setSubjPublished] = useState(true);

  // Branch Form State
  const [brSubjectId, setBrSubjectId] = useState<Id<"subjects"> | "">("");
  const [brName, setBrName] = useState("");
  const [brDesc, setBrDesc] = useState("");
  const [brOrder, setBrOrder] = useState(1);
  const [brPublished, setBrPublished] = useState(true);

  // Topic Form State
  const [topSubjectId, setTopSubjectId] = useState<Id<"subjects"> | "">("");
  const [topBranchId, setTopBranchId] = useState<string>("");
  const [topName, setTopName] = useState("");
  const [topDesc, setTopDesc] = useState("");
  const [topOrder, setTopOrder] = useState(1);
  const [topPublished, setTopPublished] = useState(true);

  // Lesson Form State
  const [lesSubjectId, setLesSubjectId] = useState<Id<"subjects"> | "">("");
  const [lesBranchId, setLesBranchId] = useState<string>("");
  const [lesTopicId, setLesTopicId] = useState<Id<"topics"> | "">("");
  const [lesName, setLesName] = useState("");
  const [lesDesc, setLesDesc] = useState("");
  const [lesOrder, setLesOrder] = useState(1);
  const [lesPublished, setLesPublished] = useState(true);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBranch = (id: string) => {
    setExpandedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateBranch = (subjectId?: Id<"subjects">) => {
    setEditingBranch(null);
    setBrSubjectId(subjectId || (subjects && subjects[0]?._id) || "");
    setBrName("");
    setBrDesc("");
    setBrOrder(1);
    setBrPublished(true);
    setBranchModalOpen(true);
  };

  const openEditBranch = (b: any) => {
    setEditingBranch(b);
    setBrSubjectId(b.subjectId);
    setBrName(b.name);
    setBrDesc(b.description || "");
    setBrOrder(b.order);
    setBrPublished(b.isPublished);
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brName.trim() || !brSubjectId) return;

    setSaving(true);
    try {
      if (editingBranch) {
        await updateBranch({
          branchId: editingBranch._id,
          name: brName.trim(),
          description: brDesc.trim() || undefined,
          order: Number(brOrder),
          isPublished: brPublished,
        });
        success("Branch updated successfully.");
      } else {
        await createBranch({
          subjectId: brSubjectId as Id<"subjects">,
          name: brName.trim(),
          description: brDesc.trim() || undefined,
          order: Number(brOrder),
          isPublished: brPublished,
        });
        success("New Branch added to subject.");
      }
      setBranchModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save branch.");
    } finally {
      setSaving(false);
    }
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

  const openCreateTopic = (subjectId?: Id<"subjects">, branchId?: string) => {
    setEditingTopic(null);
    setTopSubjectId(subjectId || (subjects && subjects[0]?._id) || "");
    setTopBranchId(branchId || "");
    setTopName("");
    setTopDesc("");
    setTopOrder(1);
    setTopPublished(true);
    setTopicModalOpen(true);
  };

  const openEditTopic = (t: any) => {
    setEditingTopic(t);
    setTopSubjectId(t.subjectId);
    setTopBranchId(t.branchId || "");
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
          subjectId: topSubjectId as Id<"subjects">,
          branchId: topBranchId ? (topBranchId as any) : null,
          name: topName.trim(),
          description: topDesc.trim() || undefined,
          order: Number(topOrder),
          isPublished: topPublished,
        });
        success("Topic updated successfully.");
      } else {
        await createTopic({
          subjectId: topSubjectId as Id<"subjects">,
          branchId: topBranchId ? (topBranchId as any) : undefined,
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

  const openCreateLesson = (subjectId?: Id<"subjects">, topicId?: Id<"topics">) => {
    setEditingLesson(null);
    const subId = subjectId || (subjects && subjects[0]?._id) || "";
    const topId = topicId || (topics && topics.find(t => t.subjectId === subId)?._id) || "";

    setLesSubjectId(subId);
    setLesTopicId(topId);
    setLesName("");
    setLesDesc("");
    
    const existingLessons = lessons?.filter(l => l.topicId === topId) || [];
    setLesOrder(existingLessons.length + 1);
    setLesPublished(true);
    setLessonModalOpen(true);
  };

  const openEditLesson = (l: any) => {
    setEditingLesson(l);
    setLesSubjectId(l.subjectId);
    setLesTopicId(l.topicId);
    setLesName(l.name);
    setLesDesc(l.description || "");
    setLesOrder(l.order);
    setLesPublished(l.isPublished);
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesName.trim() || !lesSubjectId || !lesTopicId) return;

    setSaving(true);
    try {
      if (editingLesson) {
        await updateLesson({
          lessonId: editingLesson._id,
          name: lesName.trim(),
          description: lesDesc.trim() || undefined,
          order: Number(lesOrder),
          isPublished: lesPublished,
        });
        success("Lesson updated successfully.");
      } else {
        await createLesson({
          subjectId: lesSubjectId as Id<"subjects">,
          topicId: lesTopicId as Id<"topics">,
          name: lesName.trim(),
          description: lesDesc.trim() || undefined,
          order: Number(lesOrder),
          isPublished: lesPublished,
        });
        success("New Lesson added to topic.");
      }
      setLessonModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save lesson.");
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
      } else if (deleteConfirm.type === "branch") {
        await deleteBranch({ branchId: deleteConfirm.id as any });
        success("Branch deleted.");
      } else if (deleteConfirm.type === "topic") {
        await deleteTopic({ topicId: deleteConfirm.id as Id<"topics"> });
        success("Topic deleted.");
      } else {
        await deleteLesson({ lessonId: deleteConfirm.id as Id<"lessons"> });
        success("Lesson deleted.");
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  const renderTopicItem = (topic: any, subj: any) => {
    const isTopicExpanded = expandedTopics[topic._id] !== false;
    const topicLessons = (lessons || [])
      .filter((l: any) => l.topicId === topic._id)
      .sort((a: any, b: any) => a.order - b.order);

    return (
      <div
        key={topic._id}
        className="rounded-xl bg-white dark:bg-studio-900 border border-studio-200/80 dark:border-studio-800/80 overflow-hidden shadow-sm hover:border-blueprint-500/30 transition-colors"
      >
        {/* TOPIC HEADER */}
        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-studio-100/30 dark:bg-studio-800/30">
          <div
            onClick={() => toggleTopic(topic._id)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 select-none overflow-hidden"
          >
            <button className="p-0.5 rounded text-studio-400 hover:text-studio-700 dark:hover:text-studio-200">
              {isTopicExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="text-xs font-mono font-semibold text-blueprint-600 dark:text-blueprint-400 bg-blueprint-500/10 px-1.5 py-0.5 rounded">
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

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => openCreateLesson(subj._id, topic._id)}
              title="Add Lesson under this Topic"
              className="px-2 py-1 rounded bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 hover:bg-blueprint-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Lesson</span>
            </button>
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

        {/* LEVEL 3: LESSONS LIST */}
        {isTopicExpanded && (
          <div className="p-3 border-t border-studio-200/60 dark:border-studio-800/60 bg-studio-50/30 dark:bg-studio-950/20 space-y-2">
            {topicLessons.length === 0 ? (
              <div className="text-center py-2 text-[11px] text-studio-400 italic">
                No lessons added yet. Click &quot;Add Lesson&quot; to build topic modules.
              </div>
            ) : (
              topicLessons.map((les: any) => (
                <div
                  key={les._id}
                  className="p-2.5 rounded-lg bg-studio-100/50 dark:bg-studio-800/50 border border-studio-200/50 dark:border-studio-700/50 flex items-center justify-between gap-3 hover:bg-studio-100 dark:hover:bg-studio-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <BookOpen className="w-3.5 h-3.5 text-blueprint-500 flex-shrink-0" />
                    <span className="text-[11px] font-mono font-medium text-studio-400">
                      {subj.order}.{topic.order}.{les.order}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-studio-800 dark:text-studio-200 truncate">
                          {les.name}
                        </span>
                        {les.isPublished ? (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Live
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-studio-500/10 text-studio-500">
                            Draft
                          </span>
                        )}
                      </div>
                      {les.description && (
                        <p className="text-[10px] text-studio-500 truncate">
                          {les.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditLesson(les)}
                      title="Edit Lesson"
                      className="p-1 rounded text-studio-400 hover:text-studio-700 dark:hover:text-studio-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: "lesson",
                          id: les._id,
                          name: les.name,
                        })
                      }
                      title="Delete Lesson"
                      className="p-1 rounded text-studio-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (subjects === undefined || topics === undefined || lessons === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading 3-tier curriculum hierarchy...</p>
        </div>
      </div>
    );
  }

  const sortedSubjects = [...subjects].sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Curriculum Structure
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Organize Board Exam Subjects, Syllabus Topics, and Detailed Lessons.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => openCreateLesson()}
            className="px-3.5 py-2.5 rounded-xl bg-blueprint-500/10 hover:bg-blueprint-500/20 text-blueprint-600 dark:text-blueprint-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-blueprint-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lesson</span>
          </button>
          <button
            onClick={() => openCreateTopic()}
            className="px-3.5 py-2.5 rounded-xl bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold flex items-center gap-1.5 transition-all border border-studio-300/50 dark:border-studio-700/50"
          >
            <Plus className="w-4 h-4 text-blueprint-500" />
            <span>Add Topic</span>
          </button>
          <button
            onClick={() => openCreateBranch()}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
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

      {/* Subjects, Topics & Lessons 3-Tier Accordion */}
      <div className="space-y-4">
        {sortedSubjects.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border">
            <Layers className="w-10 h-10 text-studio-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-studio-700 dark:text-studio-300">
              No subjects registered in the syllabus yet.
            </h3>
            <p className="text-xs text-studio-400 mt-1 max-w-sm mx-auto mb-4">
              Begin by creating the major Architecture Licensure Examination subject areas.
            </p>
            <button
              onClick={openCreateSubject}
              className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
            >
              Create Subject
            </button>
          </div>
        ) : (
          sortedSubjects.map((subj: any) => {
            const isSubjectExpanded = expandedSubjects[subj._id] !== false; // expanded by default
            const subjectBranches = (branches || [])
              .filter((b: any) => b.subjectId === subj._id)
              .sort((a: any, b: any) => a.order - b.order);

            const subjectTopics = topics
              .filter((t: any) => t.subjectId === subj._id)
              .sort((a: any, b: any) => a.order - b.order);

            return (
              <div
                key={subj._id}
                className="glass-panel rounded-2xl border overflow-hidden transition-all"
              >
                {/* LEVEL 1: SUBJECT HEADER ROW */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-studio-100/40 dark:bg-studio-850/40">
                  <div
                    onClick={() => toggleSubject(subj._id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 select-none overflow-hidden"
                  >
                    <button className="p-1 rounded-lg text-studio-400 hover:text-studio-700 dark:hover:text-studio-200">
                      {isSubjectExpanded ? (
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
                      onClick={() => openCreateBranch(subj._id)}
                      title="Add Branch under this Subject"
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors border border-amber-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Branch</span>
                    </button>
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

                {/* LEVEL 2: BRANCHES & TOPICS CONTAINER */}
                {isSubjectExpanded && (
                  <div className="p-4 sm:p-5 border-t border-studio-200/60 dark:border-studio-800/60 bg-studio-50/50 dark:bg-studio-950/40 space-y-4">
                    {/* Render Branches if any */}
                    {subjectBranches.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Subject Branches ({subjectBranches.length})</span>
                        </div>
                        {subjectBranches.map((br: any) => {
                          const isBranchExpanded = expandedBranches[br._id] !== false;
                          const branchTopics = subjectTopics.filter((t: any) => t.branchId === br._id);

                          return (
                            <div
                              key={br._id}
                              className="rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 overflow-hidden shadow-sm space-y-2 p-3"
                            >
                              {/* BRANCH HEADER */}
                              <div className="flex items-center justify-between gap-3">
                                <div
                                  onClick={() => toggleBranch(br._id)}
                                  className="flex items-center gap-2 cursor-pointer flex-1 select-none overflow-hidden"
                                >
                                  <button className="p-0.5 rounded text-amber-500 hover:text-amber-700 dark:hover:text-amber-300">
                                    {isBranchExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                                    Branch #{br.order}
                                  </span>
                                  <div className="truncate">
                                    <h4 className="font-bold text-xs text-amber-950 dark:text-amber-50 truncate">
                                      {br.name}
                                    </h4>
                                    {br.description && (
                                      <p className="text-[11px] text-amber-700 dark:text-amber-300/80 truncate">
                                        {br.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    onClick={() => openCreateTopic(subj._id, br._id)}
                                    title="Add Topic under this Branch"
                                    className="px-2 py-1 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Topic</span>
                                  </button>
                                  <button
                                    onClick={() => openEditBranch(br)}
                                    title="Edit Branch"
                                    className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: "branch",
                                        id: br._id,
                                        name: br.name,
                                      })
                                    }
                                    title="Delete Branch"
                                    className="p-1 text-amber-500 hover:text-rose-500 hover:bg-rose-500/10 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* BRANCH TOPICS */}
                              {isBranchExpanded && (
                                <div className="pl-3 sm:pl-4 space-y-2.5 border-l-2 border-amber-500/30 ml-2 mt-2">
                                  {branchTopics.length === 0 ? (
                                    <div className="text-[11px] text-amber-700/70 dark:text-amber-300/70 italic py-1">
                                      No topics in this branch yet. Click &quot;Add Topic&quot; above to populate topics under {br.name}.
                                    </div>
                                  ) : (
                                    branchTopics.map((topic: any) => renderTopicItem(topic, subj))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Unbranched / Direct Topics */}
                    {(() => {
                      const directTopics = subjectBranches.length > 0
                        ? subjectTopics.filter((t: any) => !t.branchId)
                        : subjectTopics;

                      if (directTopics.length === 0 && subjectBranches.length === 0) {
                        return (
                          <div className="text-center py-4 text-xs text-studio-400">
                            No topics yet. Click &quot;Add Topic&quot; or &quot;Add Branch&quot; to subdivide this subject.
                          </div>
                        );
                      }

                      if (directTopics.length === 0) return null;

                      return (
                        <div className="space-y-2.5">
                          {subjectBranches.length > 0 && (
                            <div className="text-xs font-bold uppercase tracking-wider text-studio-500 dark:text-studio-400 pt-2">
                              Direct Subject Topics ({directTopics.length})
                            </div>
                          )}
                          {directTopics.map((topic: any) => renderTopicItem(topic, subj))}
                        </div>
                      );
                    })()}
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
              placeholder="e.g., 7_Theory of Architecture"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={subjDesc}
              onChange={(e) => setSubjDesc(e.target.value)}
              placeholder="Overview of subject scope and syllabus content..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Area Weight / Order
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
                <span>{subjPublished ? "Live" : "Draft"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Branch Create / Edit Modal */}
      <Modal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        title={editingBranch ? "Edit Subject Branch" : "New Subject Branch"}
        description="Optional Level 1.5 sub-category (e.g. Professional Practice -> Laws & Regulations)."
        icon={<Layers className="w-5 h-5 text-amber-500" />}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setBranchModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="branch-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingBranch ? "Save Changes" : "Create Branch"}</span>
            </button>
          </>
        }
      >
        <form id="branch-form" onSubmit={handleSaveBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Parent Subject Area
            </label>
            <select
              value={brSubjectId}
              onChange={(e) => setBrSubjectId(e.target.value as Id<"subjects">)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="" disabled>Select Subject Area...</option>
              {sortedSubjects.map((s: any) => (
                <option key={s._id} value={s._id}>
                  Area {s.order}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Branch Name / Sub-Subject Category
            </label>
            <input
              type="text"
              value={brName}
              onChange={(e) => setBrName(e.target.value)}
              placeholder="e.g., Laws and Regulations"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={brDesc}
              onChange={(e) => setBrDesc(e.target.value)}
              placeholder="Brief summary of this branch..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Branch Order
              </label>
              <input
                type="number"
                min={1}
                value={brOrder}
                onChange={(e) => setBrOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setBrPublished(!brPublished)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  brPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border-studio-300 dark:border-studio-700"
                }`}
              >
                {brPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{brPublished ? "Live" : "Draft"}</span>
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
        description="Subdivide major subject area into topics."
        icon={<FileText className="w-5 h-5" />}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Parent Subject Area
              </label>
              <select
                value={topSubjectId}
                onChange={(e) => {
                  setTopSubjectId(e.target.value as Id<"subjects">);
                  setTopBranchId("");
                }}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="" disabled>Select Subject Area...</option>
                {sortedSubjects.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    Area {s.order}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Branch (Optional)
              </label>
              <select
                value={topBranchId}
                onChange={(e) => setTopBranchId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="">-- No Branch (Direct Subject Topic) --</option>
                {(branches || [])
                  .filter((b: any) => b.subjectId === topSubjectId)
                  .map((b: any) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Topic Title
            </label>
            <input
              type="text"
              value={topName}
              onChange={(e) => setTopName(e.target.value)}
              placeholder="e.g., Primary Elements & Spatial Ordering"
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

      {/* Lesson Create / Edit Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? "Edit Lesson Module" : "New Detailed Lesson"}
        description="Add Level 3 lesson module under a topic."
        icon={<BookOpen className="w-5 h-5" />}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lesson-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingLesson ? "Save Changes" : "Create Lesson"}</span>
            </button>
          </>
        }
      >
        <form id="lesson-form" onSubmit={handleSaveLesson} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Parent Subject Area
              </label>
              <select
                value={lesSubjectId}
                onChange={(e) => {
                  const subId = e.target.value as Id<"subjects">;
                  setLesSubjectId(subId);
                  const availableTops = topics.filter(t => t.subjectId === subId);
                  if (availableTops.length > 0) {
                    setLesTopicId(availableTops[0]._id);
                  } else {
                    setLesTopicId("");
                  }
                }}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="" disabled>Select Subject Area...</option>
                {sortedSubjects.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    Area {s.order}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Parent Topic
              </label>
              <select
                value={lesTopicId}
                onChange={(e) => setLesTopicId(e.target.value as Id<"topics">)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="" disabled>Select Topic...</option>
                {topics
                  .filter((t: any) => t.subjectId === lesSubjectId)
                  .map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Lesson Title
            </label>
            <input
              type="text"
              value={lesName}
              onChange={(e) => setLesName(e.target.value)}
              placeholder="e.g., Point, Line, Plane, & Volume in Space"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Lesson Summary / Outline
            </label>
            <textarea
              value={lesDesc}
              onChange={(e) => setLesDesc(e.target.value)}
              placeholder="Brief summary of key lesson concepts..."
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
                value={lesOrder}
                onChange={(e) => setLesOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <button
                type="button"
                onClick={() => setLesPublished(!lesPublished)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  lesPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-studio-200 dark:bg-studio-800 text-studio-600 dark:text-studio-400 border-studio-300 dark:border-studio-700"
                }`}
              >
                {lesPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{lesPublished ? "Live" : "Draft"}</span>
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
                Warning: All nested topics and lessons under this subject will also be deleted.
              </span>
            )}
            {deleteConfirm.type === "topic" && (
              <span className="block text-xs text-rose-500 mt-2 font-medium">
                Warning: All nested lessons under this topic will also be deleted.
              </span>
            )}
          </p>
        )}
      </Modal>
    </div>
  );
}
