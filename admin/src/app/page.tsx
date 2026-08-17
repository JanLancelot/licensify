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
  Sparkles,
  Loader2,
} from "lucide-react";


export default function DashboardOverviewPage() {
  const stats = useQuery(api.admin.getDashboardStats);
  const user = useQuery(api.users.getCurrentUserProfile);

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blueprint-500 animate-spin" />
          <p className="text-sm text-studio-500">Loading curriculum metrics...</p>
        </div>
      </div>
    );
  }

  const { totals, questionsByDifficulty, usersByRole, subjectBreakdown, recentQuestions } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blueprint-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blueprint-500/10 text-blueprint-600 dark:text-blueprint-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-blueprint-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ALE Studio Management Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-studio-900 dark:text-studio-50 tracking-tight">
              Welcome back, {user?.firstName || user?.username || "Architect"}!
            </h2>
            <p className="text-sm text-studio-600 dark:text-studio-400 mt-1 max-w-2xl">
              Curate the Architecture Licensure Examination curriculum. Manage questions, study notes, spaced-repetition flashcards, and mock assessments in real time.
            </p>
          </div>

          {/* Quick Action Shortcut Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <NextLink
              href="/questions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-700 active:scale-[0.98] text-white text-xs font-semibold shadow-sm shadow-blueprint-500/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Question</span>
            </NextLink>
            <NextLink
              href="/curriculum"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300/80 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold transition-all border border-studio-300/50 dark:border-studio-700/50"
            >
              <Layers className="w-4 h-4 text-blueprint-500" />
              <span>New Subject</span>
            </NextLink>
            <NextLink
              href="/materials"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-studio-200/80 dark:bg-studio-800 hover:bg-studio-300/80 dark:hover:bg-studio-700 text-studio-900 dark:text-studio-100 text-xs font-semibold transition-all border border-studio-300/50 dark:border-studio-700/50"
            >
              <BookOpen className="w-4 h-4 text-accent-emerald" />
              <span>Add Note</span>
            </NextLink>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Questions */}
        <div className="glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Questions Bank
            </span>
            <div className="w-9 h-9 rounded-xl bg-blueprint-500/10 flex items-center justify-center text-blueprint-500 group-hover:scale-110 transition-transform">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-studio-900 dark:text-studio-50">
              {totals.questions}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500">
              <span className="text-emerald-500 font-medium">{totals.publishedQuestions} live</span>
              <span>•</span>
              <span>{totals.questions - totals.publishedQuestions} draft</span>
            </div>
          </div>
        </div>

        {/* Subjects & Topics */}
        <div className="glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Curriculum Areas
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-studio-900 dark:text-studio-50">
              {totals.subjects}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500">
              <span>{totals.topics} topics defined</span>
            </div>
          </div>
        </div>

        {/* Flashcards & Materials */}
        <div className="glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Flashcards / Notes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <GalleryVerticalEnd className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-studio-900 dark:text-studio-50">
              {totals.flashcards}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500">
              <span>{totals.materials} study articles</span>
            </div>
          </div>
        </div>

        {/* Mock Exams & Users */}
        <div className="glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-blueprint-500/40 transition-colors group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Mock Exams & Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-studio-900 dark:text-studio-50">
              {totals.quizzes}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-studio-500">
              <span>{totals.users} active candidates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Health & Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-studio-900 dark:text-studio-100">
                  Curriculum Domain Balance
                </h3>
                <p className="text-xs text-studio-500">Questions and content distribution per ALE board subject</p>
              </div>
              <NextLink
                href="/curriculum"
                className="text-xs font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline flex items-center gap-1"
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
                    className="p-4 rounded-2xl bg-studio-100/50 dark:bg-studio-850/50 border border-studio-200/60 dark:border-studio-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-studio-500/10 text-studio-500 border border-studio-500/20">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-studio-500 mt-0.5">
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
                        className="p-2 rounded-xl text-studio-500 hover:text-blueprint-600 hover:bg-blueprint-500/10 transition-colors"
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
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-base text-studio-900 dark:text-studio-100 mb-1">
              Question Difficulty Mix
            </h3>
            <p className="text-xs text-studio-500 mb-4">Balance across board exam complexity tiers</p>

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
                  <span className="text-amber-500">Medium</span>
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
          <div className="p-4 rounded-2xl bg-blueprint-500/5 border border-blueprint-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blueprint-500" />
              <span className="text-xs font-bold text-studio-900 dark:text-studio-100">
                Staff & Candidate Access
              </span>
            </div>
            <div className="text-xs text-studio-500 space-y-1">
              <p>Admins: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.admin}</strong></p>
              <p>Content Managers: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.content_manager}</strong></p>
              <p>Registered Students: <strong className="text-studio-800 dark:text-studio-200">{usersByRole.student}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Questions Feed */}
      <div className="glass-panel p-6 rounded-3xl border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-studio-900 dark:text-studio-100">
              Recently Created Questions
            </h3>
            <p className="text-xs text-studio-500">Latest additions to the ALE question pool</p>
          </div>
          <NextLink
            href="/questions"
            className="text-xs font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline flex items-center gap-1"
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
