"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/context/ToastContext";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Filter,
  Search,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";



export default function QuizzesPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const quizzes = useQuery(api.quizzes.listAllQuizzesAdmin, {});
  const allQuestions = useQuery(api.questions.listAllQuestionsAdmin, {});
  const { success, error: showError } = useToast();

  const createQuiz = useMutation(api.quizzes.createQuiz);
  const updateQuiz = useMutation(api.quizzes.updateQuiz);
  const deleteQuiz = useMutation(api.quizzes.deleteQuiz);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"practice" | "mock_exam">("mock_exam");
  const [formSubjectId, setFormSubjectId] = useState<Id<"subjects"> | "">("");
  const [formTopicId, setFormTopicId] = useState<Id<"topics"> | "">("");
  const [formTimeLimitMinutes, setFormTimeLimitMinutes] = useState<number>(60);
  const [formPassingScore, setFormPassingScore] = useState<number>(75);
  const [formSelectedQuestionIds, setFormSelectedQuestionIds] = useState<Id<"questions">[]>([]);
  const [formPublished, setFormPublished] = useState(true);

  // Question Picker Search in Modal
  const [pickerSearch, setPickerSearch] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: Id<"quizzes">; title: string } | null>(null);

  const openCreateModal = () => {
    setEditingQuiz(null);
    setFormTitle("");
    setFormDescription("");
    setFormType("mock_exam");
    setFormSubjectId((subjects && subjects[0]?._id) || "");
    setFormTopicId("");
    setFormTimeLimitMinutes(60);
    setFormPassingScore(75);
    setFormSelectedQuestionIds([]);
    setFormPublished(true);
    setPickerSearch("");
    setModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuiz(q);
    setFormTitle(q.title);
    setFormDescription(q.description || "");
    setFormType(q.type);
    setFormSubjectId(q.subjectId || "");
    setFormTopicId(q.topicId || "");
    setFormTimeLimitMinutes(q.timeLimitSeconds ? Math.round(q.timeLimitSeconds / 60) : 60);
    setFormPassingScore(q.passingScore ?? 75);
    setFormSelectedQuestionIds(q.questionIds || []);
    setFormPublished(q.isPublished);
    setPickerSearch("");
    setModalOpen(true);
  };

  const toggleQuestionSelection = (qId: Id<"questions">) => {
    setFormSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (formSelectedQuestionIds.length === 0) {
      showError("Please select at least 1 question for the exam.");
      return;
    }

    setSaving(true);
    try {
      if (editingQuiz) {
        await updateQuiz({
          quizId: editingQuiz._id,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          type: formType,
          subjectId: formSubjectId ? (formSubjectId as Id<"subjects">) : undefined,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          questionIds: formSelectedQuestionIds,
          timeLimitSeconds: formTimeLimitMinutes ? formTimeLimitMinutes * 60 : undefined,
          passingScore: formPassingScore,
          isPublished: formPublished,
        });
        success("Quiz updated successfully.");
      } else {
        await createQuiz({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          type: formType,
          subjectId: formSubjectId ? (formSubjectId as Id<"subjects">) : undefined,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          questionIds: formSelectedQuestionIds,
          timeLimitSeconds: formTimeLimitMinutes ? formTimeLimitMinutes * 60 : undefined,
          passingScore: formPassingScore,
          isPublished: formPublished,
        });
        success("Mock Exam created.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await deleteQuiz({ quizId: deleteConfirm.id });
      success("Quiz deleted.");
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (quizzes === undefined || subjects === undefined || topics === undefined || allQuestions === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading assessments & mock exams...</p>
        </div>
      </div>
    );
  }

  const filteredQuizzes = quizzes.filter((q: any) => {
    if (selectedType !== "all" && q.type !== selectedType) return false;
    return true;
  });

  const pickerQuestions = allQuestions.filter((q: any) => {
    if (!pickerSearch.trim()) return true;
    return (
      q.question.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      q.choices.some((c: any) => c.text.toLowerCase().includes(pickerSearch.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Mock Exams & Assessments
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Curate fixed ALE Mock Exams and timed practice drills with custom passing benchmarks.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blueprint-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Mock Exam</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-studio-500">
            <Filter className="w-4 h-4" />
            <span>Type:</span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Assessments ({quizzes.length})</option>
            <option value="mock_exam">Mock Exams</option>
            <option value="practice">Practice Drills</option>
          </select>
        </div>

        <span className="text-xs text-studio-500">
          Showing <strong className="text-studio-800 dark:text-studio-200">{filteredQuizzes.length}</strong> items
        </span>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border">
          <Award className="w-12 h-12 text-studio-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-studio-900 dark:text-studio-100">
            No Assessments Configured
          </h3>
          <p className="text-xs text-studio-500 mt-1 mb-4">
            Curate mock exams for candidates to simulate real board examination conditions.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
          >
            Create Mock Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz: any) => {
            const subj = subjects.find((s: any) => s._id === quiz.subjectId);

            return (
              <div
                key={quiz._id}
                className="glass-panel rounded-2xl border p-5 flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        quiz.type === "mock_exam"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                          : "bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 border-blueprint-500/20"
                      }`}
                    >
                      {quiz.type === "mock_exam" ? "Mock Exam" : "Practice Drill"}
                    </span>

                    <div className="flex items-center gap-1">
                      {quiz.isPublished ? (
                        <span className="text-[10px] font-semibold text-emerald-500">Live</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-studio-400">Draft</span>
                      )}
                      <button
                        onClick={() => openEditModal(quiz)}
                        className="p-1 rounded text-studio-400 hover:text-studio-700 dark:hover:text-studio-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ id: quiz._id, title: quiz.title })}
                        className="p-1 rounded text-studio-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-studio-900 dark:text-studio-50">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-studio-500 mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mt-4 p-3 rounded-xl bg-studio-100/60 dark:bg-studio-850/60 border border-studio-200/60 dark:border-studio-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-studio-600 dark:text-studio-400">
                      <span>Questions Pool:</span>
                      <strong className="text-studio-900 dark:text-studio-100">
                        {quiz.questionIds.length} questions
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-studio-600 dark:text-studio-400">
                      <span>Passing Threshold:</span>
                      <strong className="text-studio-900 dark:text-studio-100">
                        {quiz.passingScore ?? 75}%
                      </strong>
                    </div>
                    {quiz.timeLimitSeconds && (
                      <div className="flex items-center justify-between text-studio-600 dark:text-studio-400">
                        <span>Time Limit:</span>
                        <strong className="text-studio-900 dark:text-studio-100">
                          {Math.round(quiz.timeLimitSeconds / 60)} minutes
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-studio-200/60 dark:border-studio-800/60 flex items-center justify-between text-xs text-studio-400">
                  <span className="truncate max-w-[160px]">{subj?.name || "All Syllabus Areas"}</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Quiz Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuiz ? "Edit Assessment" : "Build Mock Exam / Quiz"}
        description="Curate timed exam sets, passing score threshold, and choose questions from pool."
        icon={<Award className="w-5 h-5" />}
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
              form="quiz-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingQuiz ? "Save Changes" : "Create Exam"}</span>
            </button>
          </>
        }
      >
        <form id="quiz-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Exam Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., ALE Area 3 Comprehensive Mock Exam"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Exam Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="mock_exam">Full Mock Exam</option>
                <option value="practice">Custom Practice Drill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Description / Instructions
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Exam scope, rules, allowed calculator standards, and target score..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={formTimeLimitMinutes}
                onChange={(e) => setFormTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={formPassingScore}
                onChange={(e) => setFormPassingScore(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
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
          </div>

          {/* Question Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider">
                Select Exam Questions ({formSelectedQuestionIds.length} chosen)
              </label>
              <span className="text-xs text-studio-400 font-medium">
                Total pool: {allQuestions.length}
              </span>
            </div>

            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search question pool..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              />
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-studio-200 dark:border-studio-700 divide-y divide-studio-200 dark:divide-studio-800">
              {pickerQuestions.map((q: any) => {
                const isSelected = formSelectedQuestionIds.includes(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => toggleQuestionSelection(q._id)}
                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer text-xs transition-colors select-none ${
                      isSelected
                        ? "bg-blueprint-500/10 dark:bg-blueprint-900/30"
                        : "bg-studio-50 dark:bg-studio-900/40 hover:bg-studio-100 dark:hover:bg-studio-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-blueprint-600 rounded"
                      />
                      <p className="font-medium text-studio-800 dark:text-studio-200 truncate">
                        {q.question}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-studio-200 dark:bg-studio-700 flex-shrink-0">
                      {q.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Exam"
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
              {saving ? "Deleting..." : "Delete Exam"}
            </button>
          </>
        }
      >
        {deleteConfirm && (
          <p className="text-sm text-studio-600 dark:text-studio-400">
            Are you sure you want to delete <strong className="text-studio-900 dark:text-studio-100">&quot;{deleteConfirm.title}&quot;</strong>?
          </p>
        )}
      </Modal>

    </div>
  );
}
