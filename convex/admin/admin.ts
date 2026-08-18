import { query } from "./_generated/server";
import { getCurrentUser } from "./authHelpers";


/**
 * Admin dashboard overview metrics and recent activity aggregator.
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "admin" && user.role !== "content_manager")) {
      return null;
    }



    const [
      subjects,
      topics,
      questions,
      materials,
      flashcards,
      quizzes,
      users,
      attempts,
    ] = await Promise.all([
      ctx.db.query("subjects").collect(),
      ctx.db.query("topics").collect(),
      ctx.db.query("questions").collect(),
      ctx.db.query("materials").collect(),
      ctx.db.query("flashcards").collect(),
      ctx.db.query("quizzes").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("quizAttempts").collect(),
    ]);

    // Breakdown metrics
    const publishedSubjects = subjects.filter((s) => s.isPublished).length;
    const publishedTopics = topics.filter((t) => t.isPublished).length;
    const publishedQuestions = questions.filter((q) => q.isPublished).length;
    const publishedMaterials = materials.filter((m) => m.isPublished).length;
    const publishedFlashcards = flashcards.filter((f) => f.isPublished).length;
    const publishedQuizzes = quizzes.filter((q) => q.isPublished).length;

    const questionsByDifficulty = {
      easy: questions.filter((q) => q.difficulty === "easy").length,
      medium: questions.filter((q) => q.difficulty === "medium").length,
      hard: questions.filter((q) => q.difficulty === "hard").length,
    };

    const usersByRole = {
      student: users.filter((u) => u.role === "student").length,
      content_manager: users.filter((u) => u.role === "content_manager").length,
      admin: users.filter((u) => u.role === "admin").length,
    };

    // Subject breakdown with question counts
    const subjectBreakdown = subjects.map((subj) => {
      const subjQuestions = questions.filter((q) => q.subjectId === subj._id).length;
      const subjMaterials = materials.filter((m) => m.subjectId === subj._id).length;
      const subjFlashcards = flashcards.filter((f) => f.subjectId === subj._id).length;
      const subjTopics = topics.filter((t) => t.subjectId === subj._id).length;

      return {
        _id: subj._id,
        name: subj.name,
        isPublished: subj.isPublished,
        order: subj.order,
        topicsCount: subjTopics,
        questionsCount: subjQuestions,
        materialsCount: subjMaterials,
        flashcardsCount: subjFlashcards,
      };
    });

    // Recent 10 created questions
    const recentQuestions = questions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((q) => ({
        _id: q._id,
        question: q.question,
        difficulty: q.difficulty,
        subjectId: q.subjectId,
        createdAt: q.createdAt,
      }));

    return {
      totals: {
        subjects: subjects.length,
        publishedSubjects,
        topics: topics.length,
        publishedTopics,
        questions: questions.length,
        publishedQuestions,
        materials: materials.length,
        publishedMaterials,
        flashcards: flashcards.length,
        publishedFlashcards,
        quizzes: quizzes.length,
        publishedQuizzes,
        users: users.length,
        attempts: attempts.length,
      },
      questionsByDifficulty,
      usersByRole,
      subjectBreakdown,
      recentQuestions,
    };
  },
});
