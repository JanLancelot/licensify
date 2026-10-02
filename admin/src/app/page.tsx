"use client";

import React from "react";
import NextLink from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  FileQuestion,
  Layers,
  BookOpen,
  GalleryVerticalEnd,
  Award,
  Users,
  PlusCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";


export default function DashboardOverviewPage() {
  const stats = useQuery(api.admin.getDashboardStats);
  const user = useQuery(api.users.getCurrentUserProfile);

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
          <p className="text-sm text-studio-500 dark:text-studio-400">Loading curriculum metrics...</p>
        </div>
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8 surface-panel rounded-xl border max-w-md">
          <p className="text-sm font-semibold text-studio-700 dark:text-studio-300">
            Unable to load dashboard telemetry.
          </p>
          <p className="text-xs text-studio-400 mt-1">
            Please ensure you are signed in with an Administrator or Content Manager account.
          </p>
        </div>
      </div>
    );
  }

  const { totals, questionsByDifficulty, usersByRole, subjectBreakdown, recentQuestions } = stats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="surface-panel brand-banner p-6 sm:p-7 rounded-xl border relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-700 dark:text-brand-400 text-[10px] font-semibold uppercase tracking-[0.16em] mb-3">
              <span className="w-1.5 h-1.5 bg-brand-yellow" aria-hidden="true" />
              <span>Your curriculum workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-studio-900 dark:text-studio-50 tracking-tight">
              Welcome back, {user?.firstName || user?.username || "Architect"}!
            </h2>
            <p className="text-sm text-studio-600 dark:text-studio-400 mt-1 max-w-2xl">
              Build the next generation of architects. Your curriculum, content, and candidates at a glance.
            </p>
          </div>

          {/* Quick Action Shortcut Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <NextLink
              href="/questions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary active:scale-[0.98] text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Question</span>
            </NextLink>
            <NextLink
              href="/curriculum"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300/80 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold transition-all border border-studio-300/50 dark:border-studio-700/50"
            >
              <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>New Subject</span>
            </NextLink>
            <NextLink
              href="/materials"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300/80 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold transition-all border border-studio-300/50 dark:border-studio-700/50"
            >
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Add Note</span>
            </NextLink>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Questions */}
        <div className="surface-panel p-5 rounded-xl border flex flex-col justify-between hover:border-brand-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Question Bank
            </span>
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-studio-900 dark:text-studio-50">
              {totals.questions}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500 dark:text-studio-400">
              <span className="text-emerald-500 font-medium">{totals.publishedQuestions} live</span>
              <span>•</span>
              <span>{totals.questions - totals.publishedQuestions} draft</span>
            </div>
          </div>
        </div>

        {/* Subjects & Topics */}
        <div className="surface-panel p-5 rounded-xl border flex flex-col justify-between hover:border-brand-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Curriculum Areas
            </span>
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-studio-900 dark:text-studio-50">
              {totals.subjects}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500 dark:text-studio-400">
              <span>{totals.topics} topics defined</span>
            </div>
          </div>
        </div>

        {/* Flashcards & Materials */}
        <div className="surface-panel p-5 rounded-xl border flex flex-col justify-between hover:border-brand-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Flashcards / Notes
            </span>
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <GalleryVerticalEnd className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-studio-900 dark:text-studio-50">
              {totals.flashcards}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500 dark:text-studio-400">
              <span>{totals.materials} study articles</span>
            </div>
          </div>
        </div>

        {/* Mock Exams & Users */}
        <div className="surface-panel p-5 rounded-xl border flex flex-col justify-between hover:border-brand-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Mock Exams & Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-studio-900 dark:text-studio-50">
              {totals.quizzes}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500 dark:text-studio-400">
              <span>{totals.users} active candidates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Health & Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown List */}
        <div className="lg:col-span-2 surface-panel p-6 rounded-xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-studio-900 dark:text-studio-100">
                  Curriculum Domain Balance
                </h3>
                <p className="text-xs text-studio-500 dark:text-studio-400">Questions and content distribution per ALE board subject</p>
              </div>
              <NextLink
                href="/curriculum"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>

            <div className="space-y-4">
              {subjectBreakdown.length === 0 ? (
                <div className="text-center py-8 text-sm text-studio-400">
                  No subjects created yet. Click &quot;New Subject&quot; to begin.
                </div>
              ) : (

                subjectBreakdown.map((subj) => (
                  <div
                    key={subj._id}
                    className="p-4 rounded-xl bg-studio-100/50 dark:bg-studio-850/50 border border-studio-200/60 dark:border-studio-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-studio-900 dark:text-studio-100">
                          {subj.name}
                        </h4>
                        {subj.isPublished ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-studio-500/10 text-studio-500 dark:text-studio-400 border border-studio-500/20">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-studio-500 dark:text-studio-400 mt-0.5">
                        {subj.topicsCount} Topics • {subj.flashcardsCount} Flashcards • {subj.materialsCount} Notes
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-studio-800 dark:text-studio-200">
                          {subj.questionsCount} Questions
                        </span>
                      </div>
                      <NextLink
                        href={`/questions?subject=${subj._id}`}
                        className="p-2 rounded-lg text-studio-500 dark:text-studio-400 hover:text-brand-600 hover:bg-brand-500/10 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </NextLink>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Question Difficulty & Quick Stats */}
        <div className="surface-panel p-6 rounded-xl border flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-base text-studio-900 dark:text-studio-100 mb-1">
              Question Difficulty Mix
            </h3>
            <p className="text-xs text-studio-500 dark:text-studio-400 mb-4">Balance across board exam complexity tiers</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                  <span className="font-bold">{questionsByDifficulty.easy}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-studio-200 dark:bg-studio-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${totals.questions ? (questionsByDifficulty.easy / totals.questions) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-700 dark:text-amber-400">Medium</span>
                  <span className="font-bold">{questionsByDifficulty.medium}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-studio-200 dark:bg-studio-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{
                      width: `${totals.questions ? (questionsByDifficulty.medium / totals.questions) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-rose-500">Hard</span>
                  <span className="font-bold">{questionsByDifficulty.hard}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-studio-200 dark:bg-studio-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{
                      width: `${totals.questions ? (questionsByDifficulty.hard / totals.questions) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Staff info */}
          <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold text-studio-900 dark:text-studio-100">
                Staff & Candidate Access
              </span>
            </div>
            <div className="text-xs text-studio-500 dark:text-studio-400 space-y-1">
              <p>Admins: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.admin}</strong></p>
              <p>Content Managers: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.content_manager}</strong></p>
              <p>Registered Students: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.student}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Questions Feed */}
      <div className="surface-panel p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-studio-900 dark:text-studio-100">
              Recently Created Questions
            </h3>
            <p className="text-xs text-studio-500 dark:text-studio-400">Latest additions to the ALE question pool</p>
          </div>
          <NextLink
            href="/questions"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Open Question Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        {recentQuestions.length === 0 ? (
          <div className="text-center py-8 text-sm text-studio-400">
            No questions logged yet.
          </div>
        ) : (
          <div className="divide-y divide-studio-200/60 dark:divide-studio-800/60">
            {recentQuestions.map((q) => (
              <div key={q._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      q.difficulty === "easy"
                        ? "bg-emerald-500"
                        : q.difficulty === "medium"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <p className="text-sm font-medium text-studio-800 dark:text-studio-200 truncate">
                    {q.question}
                  </p>
                </div>
                <span className="text-xs text-studio-400 flex-shrink-0">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
