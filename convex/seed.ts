import { mutation } from "./_generated/server";
import { v } from "convex/values";


/**
 * Database Seeding Mutation
 * Populates real Architectural Licensure Examination (ALE) subjects, topics, flashcards, and question bank.
 *
 * Call via: `npx convex run seed:seedDatabase`
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Seed System Admin User
    let admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", "system_admin_seed"))
      .first();

    if (!admin) {
      const adminId = await ctx.db.insert("users", {
        userId: "system_admin_seed",
        username: "ArchAdmin",
        firstName: "Architecture",
        lastName: "Board Reviewer",
        role: "admin",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      admin = (await ctx.db.get(adminId))!;
    }

    // Check if database already seeded
    const existingSubject = await ctx.db.query("subjects").first();
    if (existingSubject) {
      return { message: "Database already contains subject data. Seeding skipped." };
    }

    // 2. Seed Subjects
    const historySubId = await ctx.db.insert("subjects", {
      name: "History & Theory of Architecture",
      description: "Evolution of architectural styles from Antiquity to Modernity.",
      isPublished: true,
      order: 1,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const utilitiesSubId = await ctx.db.insert("subjects", {
      name: "Building Utilities & Sanitation",
      description: "Plumbing, HVAC, electrical, and mechanical systems for buildings.",
      isPublished: true,
      order: 2,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const structuralSubId = await ctx.db.insert("subjects", {
      name: "Structural Design & Construction",
      description: "Theory of structures, concrete, steel, and timber design.",
      isPublished: true,
      order: 3,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Seed Topics
    const classicalTopicId = await ctx.db.insert("topics", {
      subjectId: historySubId,
      name: "Classical Architecture (Greek & Roman)",
      description: "Orders of architecture, temples, and Roman engineering structures.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const gothicTopicId = await ctx.db.insert("topics", {
      subjectId: historySubId,
      name: "Gothic & Renaissance Architecture",
      description: "Pointed arches, flying buttresses, and humanism in design.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const plumbingTopicId = await ctx.db.insert("topics", {
      subjectId: utilitiesSubId,
      name: "Sanitary & Plumbing Systems",
      description: "National Plumbing Code of the Philippines, drainage, and water supply.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Seed Reviewer Materials
    await ctx.db.insert("materials", {
      subjectId: historySubId,
      topicId: classicalTopicId,
      title: "The Three Classical Greek Orders",
      description: "Comprehensive guide to Doric, Ionic, and Corinthian columns.",
      type: "article",
      content: `# The Classical Greek Orders\n\n1. **Doric Order**: Simplest order, characteristically plain capital and no base.\n2. **Ionic Order**: Distinguished by volutes (spiral scrolls) on capitals.\n3. **Corinthian Order**: Most ornate, featuring stylized acanthus leaves.`,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Seed Flashcards
    await ctx.db.insert("flashcards", {
      subjectId: historySubId,
      topicId: classicalTopicId,
      front: "Which Classical Order features capitals decorated with acanthus leaves?",
      back: "Corinthian Order",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flashcards", {
      subjectId: historySubId,
      topicId: classicalTopicId,
      front: "Who designed the Guggenheim Museum in Bilbao, Spain?",
      back: "Frank Gehry",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flashcards", {
      subjectId: utilitiesSubId,
      topicId: plumbingTopicId,
      front: "What is the minimum slope requirement for horizontal drainage pipes per NPCP?",
      back: "2% or 1/4 inch per foot",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 6. Seed Questions & Embedded Choices
    const q1Id = await ctx.db.insert("questions", {
      subjectId: historySubId,
      topicId: classicalTopicId,
      question: "Which architect designed Fallingwater (Edgar J. Kaufmann Sr. Residence) in Pennsylvania?",
      choices: [
        { id: "choice_a", text: "Le Corbusier" },
        { id: "choice_b", text: "Frank Lloyd Wright" },
        { id: "choice_c", text: "Mies van der Rohe" },
        { id: "choice_d", text: "Louis Sullivan" },
      ],
      correctChoiceId: "choice_b",
      explanation: "Fallingwater was designed by Frank Lloyd Wright in 1935 as a organic architecture masterpiece.",
      difficulty: "easy",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const q2Id = await ctx.db.insert("questions", {
      subjectId: historySubId,
      topicId: gothicTopicId,
      question: "Which key architectural innovation allowed Gothic cathedrals to have thinner walls and larger stained glass windows?",
      choices: [
        { id: "choice_a", text: "Barrel Vaults" },
        { id: "choice_b", text: "Flying Buttresses" },
        { id: "choice_c", text: "Domes on Pendentives" },
        { id: "choice_d", text: "Corbelled Arches" },
      ],
      correctChoiceId: "choice_b",
      explanation: "Flying buttresses redistributed lateral roof loads downward to exterior piers.",
      difficulty: "medium",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const q3Id = await ctx.db.insert("questions", {
      subjectId: utilitiesSubId,
      topicId: plumbingTopicId,
      question: "In plumbing systems, what device prevents sewer gases from entering indoor spaces?",
      choices: [
        { id: "choice_a", text: "Check Valve" },
        { id: "choice_b", text: "P-Trap (Water Seal Trap)" },
        { id: "choice_c", text: "Cleanout Plug" },
        { id: "choice_d", text: "Air Gap" },
      ],
      correctChoiceId: "choice_b",
      explanation: "The water seal trapped inside the curve of a P-trap blocks noxious gases from ascending back up drains.",
      difficulty: "easy",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 7. Seed Curated Mock Board Exam
    const mockExamId = await ctx.db.insert("quizzes", {
      title: "ALE Practice Mock Exam #1 — Architectural History & Utilities",
      description: "Curated practice examination covering history, theory, and building plumbing systems.",
      type: "mock_exam",
      subjectId: historySubId,
      questionIds: [q1Id, q2Id, q3Id],
      timeLimitSeconds: 3600, // 1 Hour
      passingScore: 75,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      seeded: {
        subjects: 3,
        topics: 3,
        materials: 1,
        flashcards: 3,
        questions: 3,
        mockExamId,
      },
    };
  },
});

/**
 * Promote any user by email to System Administrator
 * Usage: npx convex run seed:promoteUserToAdmin '{"email": "your_email@example.com"}'
 */
export const promoteUserToAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email.trim().toLowerCase()))
      .first();

    if (!user) {
      throw new Error(`No registered account found with email: "${args.email}". Please sign in or register first.`);
    }

    await ctx.db.patch(user._id, {
      role: "admin",
      isActive: true,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `User ${args.email} (${user.username}) successfully promoted to Administrator!`,
    };
  },
});

