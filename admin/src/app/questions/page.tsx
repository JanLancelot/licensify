"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useToast } from "@/context/ToastContext";
import {
  FileQuestion,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";




interface Choice {
  id: string;
  text: string;
}

export default function QuestionsPage() {
  const subjects = useQuery(api.subjects.listAllSubjects);
  const topics = useQuery(api.topics.listAllTopicsAdmin, {});
  const { success, error: showError } = useToast();

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const questions = useQuery(api.questions.listAllQuestionsAdmin, {
    subjectId: selectedSubject !== "all" ? (selectedSubject as Id<"subjects">) : undefined,
    topicId: selectedTopic !== "all" ? (selectedTopic as Id<"topics">) : undefined,
    difficulty:
      selectedDifficulty !== "all"
        ? (selectedDifficulty as "easy" | "medium" | "hard")
        : undefined,
    search: searchQuery.trim() || undefined,
  });

  const createQuestion = useMutation(api.questions.createQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const bulkCreateQuestions = useMutation(api.questions.bulkCreateQuestions);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Single Question Form State
  const [formSubjectId, setFormSubjectId] = useState<Id<"subjects"> | "">("");
  const [formTopicId, setFormTopicId] = useState<Id<"topics"> | "">("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [formChoices, setFormChoices] = useState<Choice[]>([
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ]);
  const [formCorrectId, setFormCorrectId] = useState("a");
  const [formExplanation, setFormExplanation] = useState("");
  const [formPublished, setFormPublished] = useState(true);

  // Bulk Import State
  const [bulkRawText, setBulkRawText] = useState("");
  const [bulkParsedItems, setBulkParsedItems] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: Id<"questions">; text: string } | null>(null);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormSubjectId((subjects && subjects[0]?._id) || "");
    setFormTopicId("");
    setFormQuestion("");
    setFormDifficulty("medium");
    setFormChoices([
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ]);
    setFormCorrectId("a");
    setFormExplanation("");
    setFormPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setFormSubjectId(q.subjectId);
    setFormTopicId(q.topicId || "");
    setFormQuestion(q.question);
    setFormDifficulty(q.difficulty);
    setFormChoices(q.choices.map((c: any) => ({ id: c.id, text: c.text })));
    setFormCorrectId(q.correctChoiceId);
    setFormExplanation(q.explanation || "");
    setFormPublished(q.isPublished);
    setModalOpen(true);
  };

  const handleChoiceTextChange = (id: string, text: string) => {
    setFormChoices((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const addChoice = () => {
    const nextLetter = String.fromCharCode(97 + formChoices.length); // a, b, c, d, e...
    setFormChoices((prev) => [...prev, { id: nextLetter, text: "" }]);
  };

  const removeChoice = (id: string) => {
    if (formChoices.length <= 2) {
      showError("A question must have at least 2 choices.");
      return;
    }
    const remaining = formChoices.filter((c) => c.id !== id);
    setFormChoices(remaining);
    if (formCorrectId === id) {
      setFormCorrectId(remaining[0].id);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formSubjectId) return;

    // Validate choices have text
    const emptyChoice = formChoices.find((c) => !c.text.trim());
    if (emptyChoice) {
      showError(`Please fill in text for Choice ${emptyChoice.id.toUpperCase()}`);
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        await updateQuestion({
          questionId: editingQuestion._id,
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          question: formQuestion.trim(),
          choices: formChoices.map((c) => ({ id: c.id, text: c.text.trim() })),
          correctChoiceId: formCorrectId,
          explanation: formExplanation.trim() || undefined,
          difficulty: formDifficulty,
          isPublished: formPublished,
        });
        success("Question updated successfully.");
      } else {
        await createQuestion({
          subjectId: formSubjectId as Id<"subjects">,
          topicId: formTopicId ? (formTopicId as Id<"topics">) : undefined,
          question: formQuestion.trim(),
          choices: formChoices.map((c) => ({ id: c.id, text: c.text.trim() })),
          correctChoiceId: formCorrectId,
          explanation: formExplanation.trim() || undefined,
          difficulty: formDifficulty,
          isPublished: formPublished,
        });
        success("New question added to bank.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showError(err?.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  // Bulk Import Parsing
  const handleParseBulkData = () => {
    setBulkError(null);
    if (!bulkRawText.trim()) {
      setBulkError("Please paste JSON or CSV data.");
      return;
    }

    const defaultSubjectId = (subjects && subjects[0]?._id) as Id<"subjects">;

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(bulkRawText);
      if (Array.isArray(parsed)) {
        const validated = parsed.map((item, idx) => {
          if (!item.question || !Array.isArray(item.choices) || !item.correctChoiceId) {
            throw new Error(`Item at row ${idx + 1} is missing required fields (question, choices, correctChoiceId).`);
          }
          return {
            subjectId: item.subjectId || defaultSubjectId,
            topicId: item.topicId || undefined,
            question: item.question,
            choices: item.choices.map((c: any, cIdx: number) => ({
              id: c.id || String.fromCharCode(97 + cIdx),
              text: typeof c === "string" ? c : c.text,
            })),
            correctChoiceId: item.correctChoiceId,
            explanation: item.explanation || "",
            difficulty: item.difficulty || "medium",
            isPublished: item.isPublished ?? true,
          };
        });
        setBulkParsedItems(validated);
        success(`Parsed ${validated.length} questions from JSON!`);
        return;
      }
    } catch {
      // If not JSON, try simple CSV parser

      // Format: Question,Choice A,Choice B,Choice C,Choice D,CorrectChoice (a/b/c/d),Explanation,Difficulty
      try {
        const lines = bulkRawText.split("\n").filter((l) => l.trim().length > 0);
        const csvItems: any[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.toLowerCase().startsWith("question,") && i === 0) continue; // skip header

          const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
          if (parts.length >= 6) {
            const [qText, cA, cB, cC, cD, correct, expl, diff] = parts;
            csvItems.push({
              subjectId: defaultSubjectId,
              question: qText,
              choices: [
                { id: "a", text: cA },
                { id: "b", text: cB },
                ...(cC ? [{ id: "c", text: cC }] : []),
                ...(cD ? [{ id: "d", text: cD }] : []),
              ],
              correctChoiceId: (correct || "a").toLowerCase(),
              explanation: expl || "",
              difficulty: (diff === "easy" || diff === "hard" ? diff : "medium") as "easy" | "medium" | "hard",
              isPublished: true,
            });
          }
        }

        if (csvItems.length > 0) {
          setBulkParsedItems(csvItems);
          success(`Parsed ${csvItems.length} questions from CSV!`);
          return;
        }
      } catch {
        // Continue to error
      }
      setBulkError("Failed to parse data. Please check JSON format or CSV columns.");
    }
  };

  const handleExecuteBulkImport = async () => {
    if (bulkParsedItems.length === 0) return;

    setSaving(true);
    try {
      const res = await bulkCreateQuestions({ items: bulkParsedItems });
      success(`Successfully imported ${res.count} questions into the bank!`);
      setBulkModalOpen(false);
      setBulkRawText("");
      setBulkParsedItems([]);
    } catch (err: any) {
      showError(err?.message || "Failed to commit bulk import.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await deleteQuestion({ questionId: deleteConfirm.id });
      success("Question deleted from bank.");
      setDeleteConfirm(null);
    } catch (err: any) {
      showError(err?.message || "Failed to delete question.");
    } finally {
      setSaving(false);
    }
  };

  if (questions === undefined || subjects === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading question bank...</p>
        </div>
      </div>
    );
  }

  const availableTopics = selectedSubject !== "all" ? topics.filter((t) => t.subjectId === selectedSubject) : topics;
  const availableTopicsForForm = topics.filter((t) => t.subjectId === formSubjectId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-studio-900 dark:text-studio-50">
            Question Bank Studio
          </h2>
          <p className="text-sm text-studio-500 dark:text-studio-400">
            Author multiple choice questions, assign correct answers, explanations, and import questions in bulk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300/80 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold flex items-center gap-2 transition-all border border-studio-300/50 dark:border-studio-700/50"
          >
            <Upload className="w-4 h-4 text-blueprint-500" />
            <span>Bulk JSON / CSV Import</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blueprint-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Question</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-studio-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text or explanations..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic("all");
            }}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Subjects</option>
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

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <span className="text-xs text-studio-500">
          Showing <strong className="text-studio-800 dark:text-studio-200">{questions.length}</strong> questions
        </span>
      </div>

      {/* Question Cards List */}
      {questions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border">
          <FileQuestion className="w-12 h-12 text-studio-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-studio-900 dark:text-studio-100">
            No Questions Match Filters
          </h3>
          <p className="text-xs text-studio-500 mt-1 mb-4">
            Create new architectural drill questions or import from CSV.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blueprint-600 text-white text-xs font-semibold shadow-sm"
          >
            Create Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const subj = subjects.find((s) => s._id === q.subjectId);
            const top = topics.find((t) => t._id === q.topicId);

            return (
              <div
                key={q._id}
                className="glass-panel rounded-2xl border p-5 hover:border-blueprint-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blueprint-600 dark:text-blueprint-400">
                        Q{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          q.difficulty === "easy"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : q.difficulty === "medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {q.isPublished ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-studio-500/10 text-studio-500 border border-studio-500/20">
                          Draft
                        </span>
                      )}
                      <span className="text-xs text-studio-400 font-medium">
                        {subj?.name} {top && `• ${top.name}`}
                      </span>
                    </div>

                    <p className="font-semibold text-sm sm:text-base text-studio-900 dark:text-studio-50 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Choices Grid */}
                    {/* Choices Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {q.choices.map((c) => {
                        const isCorrect = c.id === q.correctChoiceId;
                        const choiceLabel = c.id.replace(/^choice_?/i, "").toUpperCase() || c.id.toUpperCase();
                        return (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                                : "bg-studio-100/50 dark:bg-studio-850/50 border-studio-200/60 dark:border-studio-800/60 text-studio-700 dark:text-studio-300"
                            }`}
                          >
                            <span
                              className={`min-w-[22px] h-5.5 px-1.5 rounded-md flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-studio-200 dark:bg-studio-700 text-studio-600 dark:text-studio-300"
                              }`}
                            >
                              {choiceLabel}
                            </span>
                            <span className="truncate flex-1">{c.text}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-blueprint-500/5 border border-blueprint-500/20 text-xs text-studio-600 dark:text-studio-400 mt-2">
                        <strong className="text-blueprint-600 dark:text-blueprint-400">Explanation / Reference: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:self-start">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 rounded-lg text-studio-500 hover:text-studio-900 dark:hover:text-studio-100 hover:bg-studio-100 dark:hover:bg-studio-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: q._id, text: q.question })}
                      className="p-1.5 rounded-lg text-studio-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? "Edit Board Exam Question" : "New Multiple Choice Question"}
        description="Configure question prompt, answer choices, explanation, and syllabus tags."
        icon={<FileQuestion className="w-5 h-5" />}
        maxWidth="2xl"
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
              form="question-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingQuestion ? "Save Changes" : "Create Question"}</span>
            </button>
          </>
        }
      >
        <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Board Exam Subject Area
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
              Question Prompt
            </label>
            <textarea
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder="State the problem, architectural standard, or board exam question..."
              rows={3}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          {/* Multiple Choice Options Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider">
                Answer Choices (Select radio button for Correct Answer)
              </label>
              <button
                type="button"
                onClick={addChoice}
                className="text-xs font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice Option</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {formChoices.map((choice) => {
                const choiceLabel = choice.id.replace(/^choice_?/i, "").toUpperCase() || choice.id.toUpperCase();
                return (
                  <div key={choice.id} className="flex items-center gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctChoice"
                        checked={formCorrectId === choice.id}
                        onChange={() => setFormCorrectId(choice.id)}
                        className="w-4 h-4 text-blueprint-600 focus:ring-blueprint-500"
                      />
                      <span className="w-6 h-6 rounded-lg bg-studio-200 dark:bg-studio-700 font-bold text-xs flex items-center justify-center uppercase">
                        {choiceLabel}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                      placeholder={`Option ${choiceLabel} text...`}
                      required
                      className="flex-1 px-4 py-2 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500"
                    />
                    {formChoices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(choice.id)}
                        className="p-1.5 rounded-lg text-studio-400 hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Explanation & Code Reference
            </label>
            <textarea
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="Explain why this choice is correct (e.g., BP 344 Rule II, Sec 3)..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
                Difficulty Tier
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-sm focus:outline-none focus:ring-2 focus:ring-blueprint-500"
              >
                <option value="easy">Easy (Definitions & Basic Terms)</option>
                <option value="medium">Medium (Code Clauses & Application)</option>
                <option value="hard">Hard (Complex Computations & Situational)</option>
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
                <span>{formPublished ? "Live / Active in Quizzes" : "Draft"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Question Importer (JSON / CSV)"
        description="Import multiple questions at once with automated schema validation."
        icon={<FileSpreadsheet className="w-5 h-5" />}
        maxWidth="3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteBulkImport}
              disabled={saving || bulkParsedItems.length === 0}
              className="px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Commit {bulkParsedItems.length} Questions to Database</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {bulkError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{bulkError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-studio-700 dark:text-studio-300 uppercase tracking-wider mb-1.5">
              Paste JSON Array or CSV Text
            </label>
            <textarea
              value={bulkRawText}
              onChange={(e) => setBulkRawText(e.target.value)}
              placeholder={`[
  {
    "question": "What is the maximum stair riser height under NBCP?",
    "choices": [
      { "id": "a", "text": "150mm" },
      { "id": "b", "text": "200mm" },
      { "id": "c", "text": "250mm" },
      { "id": "d", "text": "300mm" }
    ],
    "correctChoiceId": "b",
    "difficulty": "easy",
    "explanation": "NBCP Rule VII prescribes maximum 200mm riser."
  }
]`}
              rows={8}
              className="w-full p-4 font-mono text-xs rounded-xl bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleParseBulkData}
              className="px-4 py-2 rounded-xl bg-studio-200 dark:bg-studio-800 hover:bg-studio-300 dark:hover:bg-studio-700 text-xs font-semibold text-studio-800 dark:text-studio-200 transition-colors"
            >
              Validate & Parse
            </button>

            {bulkParsedItems.length > 0 && (
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{bulkParsedItems.length} questions ready to import</span>
              </span>
            )}
          </div>

          {/* Preview parsed items table */}
          {bulkParsedItems.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-studio-200 dark:border-studio-700 divide-y divide-studio-200 dark:divide-studio-800 text-xs">
              {bulkParsedItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-studio-50 dark:bg-studio-900/50 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="font-semibold text-studio-900 dark:text-studio-100 truncate">
                      {idx + 1}. {item.question}
                    </p>
                    <p className="text-[11px] text-studio-500">
                      {item.choices.length} choices • Correct: <strong>{item.correctChoiceId.toUpperCase()}</strong> • {item.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Question"
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
              {saving ? "Deleting..." : "Delete Question"}
            </button>
          </>
        }
      >
        {deleteConfirm && (
          <p className="text-sm text-studio-600 dark:text-studio-400">
            Are you sure you want to permanently delete this question (<strong className="text-studio-900 dark:text-studio-100">&quot;{deleteConfirm.text.slice(0, 50)}...&quot;</strong>)?
          </p>
        )}
      </Modal>
    </div>
  );
}


