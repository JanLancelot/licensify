"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  FileSpreadsheet,
  Code,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { parseMockExamText } from "@/lib/examParser";

export interface ParsedQuestionItem {
  id?: string;
  question: string;
  questionType?: "multiple_choice" | "identification" | "essay";
  choices?: { id: string; text: string }[];
  correctChoiceId?: string;
  acceptedAnswers?: string[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  subjectId: Id<"subjects">;
  topicId?: Id<"topics">;
}

export interface SmartDocumentImporterProps {
  subjects: any[];
  defaultSubjectId: Id<"subjects">;
  onImport: (items: ParsedQuestionItem[]) => Promise<void>;
  onClose: () => void;
}

export function SmartDocumentImporter({
  subjects,
  defaultSubjectId,
  onImport,
  onClose,
}: SmartDocumentImporterProps) {
  const [activeTab, setActiveTab] = useState<"ai_pdf" | "csv" | "json">("ai_pdf");
  const [selectedSubjectId, setSelectedSubjectId] = useState<Id<"subjects">>(defaultSubjectId);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Exam Document Parser state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [examText, setExamText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // CSV & JSON state
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | null) => {
    setPdfFile(file);
    setError(null);
    if (!file) return;

    try {
      const text = await file.text();
      // If the text is human-readable (not binary PDF header '%PDF')
      if (text && !text.includes("\0") && text.length > 10) {
        setExamText(text);
      }
    } catch {
      // non-text format
    }
  };

  // Real Mock Exam Document Ingestion Handler
  const handleStartExtraction = async () => {
    setIsExtracting(true);
    setError(null);

    try {
      let content = examText.trim();
      if (!content && pdfFile) {
        try {
          content = await pdfFile.text();
        } catch {
          content = "";
        }
      }

      if (!content) {
        setError("Please paste the mock exam text or select an exam document file.");
        return;
      }

      const generated = parseMockExamText(content, {
        subjectId: selectedSubjectId,
        defaultDifficulty: difficulty,
      });

      if (generated.length === 0) {
        setError(
          "Could not recognize questions from this text. Ensure each question starts with a number (e.g., '1. ' or 'Question 1: ') and choices use letters (A, B, C, D). If you uploaded a binary PDF/Word document, please copy and paste the text directly into the box below."
        );
        return;
      }

      setExtractedQuestions(generated);
    } catch (err: any) {
      setError(err?.message || "Failed to parse document.");
    } finally {
      setIsExtracting(false);
    }
  };

  // CSV Parsing
  const handleParseCsv = () => {
    setError(null);
    if (!rawText.trim()) {
      setError("Please paste CSV data.");
      return;
    }

    try {
      const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
      const items: ParsedQuestionItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().startsWith("question,") && i === 0) continue;

        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 6) {
          const [qText, cA, cB, cC, cD, correct, expl] = parts;
          items.push({
            id: `csv_${i}`,
            question: qText,
            questionType: "multiple_choice",
            choices: [
              { id: "a", text: cA },
              { id: "b", text: cB },
              ...(cC ? [{ id: "c", text: cC }] : []),
              ...(cD ? [{ id: "d", text: cD }] : []),
            ],
            correctChoiceId: (correct || "a").toLowerCase(),
            explanation: expl || "",
            difficulty,
            subjectId: selectedSubjectId,
          });
        }
      }

      setExtractedQuestions(items);
    } catch (err: any) {
      setError("CSV parsing error: " + err.message);
    }
  };

  // JSON Parsing
  const handleParseJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        const validated: ParsedQuestionItem[] = parsed.map((item, idx) => ({
          id: `json_${idx}`,
          question: item.question,
          questionType: item.questionType || "multiple_choice",
          choices: item.choices || [],
          correctChoiceId: item.correctChoiceId || "a",
          acceptedAnswers: item.acceptedAnswers,
          explanation: item.explanation || "",
          difficulty: item.difficulty || difficulty,
          subjectId: item.subjectId || selectedSubjectId,
        }));
        setExtractedQuestions(validated);
      }
    } catch (err: any) {
      setError("Invalid JSON format: " + err.message);
    }
  };

  const updateChoice = (qIdx: number, choiceId: string) => {
    setExtractedQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, correctChoiceId: choiceId } : q))
    );
  };

  const removeQuestion = (qIdx: number) => {
    setExtractedQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleExecuteImport = async () => {
    if (extractedQuestions.length === 0) return;
    setImporting(true);
    try {
      await onImport(extractedQuestions);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* 3-Tab Header */}
      <div className="flex items-center gap-2 border-b border-studio-200 dark:border-studio-700 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("ai_pdf")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "ai_pdf"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>PDF & Document AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("csv")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "csv"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Excel / CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "json"
              ? "bg-brand-500 text-white shadow-sm"
              : "text-studio-600 dark:text-studio-400 hover:bg-studio-100 dark:hover:bg-studio-800"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Raw JSON</span>
        </button>
      </div>

      {/* Target Configs: Subject & Default Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-studio-50 dark:bg-studio-850 p-3 rounded-lg border border-studio-200 dark:border-studio-700/80">
        <div>
          <label className="block text-[10px] font-bold text-studio-500 uppercase mb-1">
            Target Subject Area
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value as Id<"subjects">)}
            className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-studio-500 uppercase mb-1">
            Default Difficulty Tier
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-studio-800 border border-studio-200 dark:border-studio-700 text-xs"
          >
            <option value="easy">Easy (Definitions & Basic Terms)</option>
            <option value="medium">Medium (Code Application)</option>
            <option value="hard">Hard (Complex Computations)</option>
          </select>
        </div>
      </div>

      {/* Tab 1: AI PDF & Mock Exam Text Parser */}
      {activeTab === "ai_pdf" && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-studio-300 dark:border-studio-700 hover:border-brand-500 bg-studio-50 dark:bg-studio-850 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
          >
            <Upload className="w-6 h-6 text-studio-400 group-hover:text-brand-500 mb-1.5 transition-colors" />
            <span className="text-xs font-bold text-studio-900 dark:text-studio-100">
              {pdfFile ? pdfFile.name : "Drop Mock Exam Document (.txt, .md, .docx, .pdf) or Click to Browse"}
            </span>
            <span className="text-[11px] text-studio-500 dark:text-studio-400 mt-0.5">
              Supports 30+ question mock exams with answer keys at the bottom or inline.
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-studio-500">
              <span className="font-semibold text-studio-700 dark:text-studio-300 flex items-center gap-1">
                <ClipboardPaste className="w-3.5 h-3.5" />
                Or Paste Mock Exam Text Directly:
              </span>
              <span>Questions 1 to 30+ with Choices (A-D) & Answer Key</span>
            </div>
            <textarea
              value={examText}
              onChange={(e) => setExamText(e.target.value)}
              rows={6}
              placeholder={`1. Under PD 1096, what is the minimum ceiling height for habitable rooms with artificial ventilation?\nA. 2.10 meters\nB. 2.40 meters\nC. 2.70 meters\nD. 3.00 meters\n\n2. Which classical order is characterized by spiral volutes?\nA. Doric\nB. Ionic\nC. Corinthian\nD. Composite\n\nANSWER KEY:\n1. B - Section 707\n2. B - Spiral volutes`}
              className="w-full p-3 font-mono text-xs rounded-lg bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={handleStartExtraction}
            disabled={isExtracting || (!examText.trim() && !pdfFile)}
            className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting & Parsing Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Questions & Answer Key</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 2 & 3: CSV & JSON Paste Surface */}
      {(activeTab === "csv" || activeTab === "json") && (
        <div className="space-y-2">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder={
              activeTab === "csv"
                ? "Question,Choice A,Choice B,Choice C,Choice D,Correct(a/b/c/d),Explanation"
                : '[{ "question": "...", "choices": [...], "correctChoiceId": "b" }]'
            }
            className="w-full p-3 font-mono text-xs rounded-lg bg-studio-100 dark:bg-studio-800 border border-studio-200 dark:border-studio-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={activeTab === "csv" ? handleParseCsv : handleParseJson}
            className="w-full py-2 rounded-lg bg-studio-200 dark:bg-studio-700 hover:bg-studio-300 text-studio-800 dark:text-studio-200 font-semibold text-xs transition-colors"
          >
            Parse {activeTab.toUpperCase()} Data
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* In-Modal Staging Preview Table */}
      {extractedQuestions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-studio-200 dark:border-studio-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-studio-900 dark:text-studio-100">
              Staging Preview ({extractedQuestions.length} Items Detected)
            </span>
            <span className="text-[11px] text-studio-500">
              Review and click to toggle correct choice before publishing
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {extractedQuestions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-3 rounded-lg bg-white dark:bg-studio-800/80 border border-studio-200 dark:border-studio-700 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      Q{qIdx + 1}.
                    </span>
                    <span className="font-medium text-studio-800 dark:text-studio-200">
                      {q.question}
                    </span>
                    {q.questionType && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-studio-200 dark:bg-studio-700 text-studio-700 dark:text-studio-300">
                        {q.questionType}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="text-studio-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Choices (Multiple Choice) */}
                {q.choices && q.choices.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.choices.map((c) => {
                      const isCorrect = q.correctChoiceId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => updateChoice(qIdx, c.id)}
                          className={`flex items-center gap-1.5 p-1.5 rounded text-left transition-colors border text-xs ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "bg-studio-50 dark:bg-studio-750 border-studio-200 dark:border-studio-700 text-studio-600 dark:text-studio-400 hover:bg-studio-100"
                          }`}
                        >
                          <span className="uppercase font-bold">{c.id}.</span>
                          <span className="truncate">{c.text}</span>
                          {isCorrect && <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Accepted Answers (Identification) */}
                {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                  <div className="text-[11px] text-studio-500 flex items-center gap-1">
                    <span className="font-semibold text-studio-700 dark:text-studio-300">
                      Accepted Answers:
                    </span>
                    <span>{q.acceptedAnswers.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Confirm Import Button */}
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={importing}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Confirm & Import {extractedQuestions.length} Questions to Bank</span>
          </button>
        </div>
      )}
    </div>
  );
}
