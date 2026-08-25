import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Database Seeding Mutation
 * Populates real Architectural Licensure Examination (ALE) subjects, topics, lessons, flashcards, and question bank.
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

    // Check if 7_Theory of Architecture already seeded
    const existingTheorySub = await ctx.db
      .query("subjects")
      .filter((q) => q.eq(q.field("name"), "7_Theory of Architecture"))
      .first();

    if (existingTheorySub) {
      return { message: "7_Theory of Architecture is already seeded." };
    }

    // 2. Seed Subjects
    const theorySubId = await ctx.db.insert("subjects", {
      name: "7_Theory of Architecture",
      description: "Architectural design principles, human factors, proportion systems, and architectural philosophies.",
      isPublished: true,
      order: 1,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const historySubId = await ctx.db.insert("subjects", {
      name: "History of Architecture",
      description: "Evolution of architectural styles from Antiquity to Modernity.",
      isPublished: true,
      order: 2,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const utilitiesSubId = await ctx.db.insert("subjects", {
      name: "Building Utilities & Sanitation",
      description: "Plumbing, HVAC, electrical, and mechanical systems for buildings.",
      isPublished: true,
      order: 3,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Seed Topics under 7_Theory of Architecture
    const spatialTopicId = await ctx.db.insert("topics", {
      subjectId: theorySubId,
      name: "Primary Elements & Spatial Ordering",
      description: "Fundamental spatial components, organizations, and ordering principles in architectural design.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const humanFactorsTopicId = await ctx.db.insert("topics", {
      subjectId: theorySubId,
      name: "Human Factors, Ergonomics, & Perception",
      description: "Body dimensions, personal space, proxemics, and psychological principles in design.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const proportionTopicId = await ctx.db.insert("topics", {
      subjectId: theorySubId,
      name: "Proportion Systems & Theories of Scale",
      description: "Golden ratio, Modulor, Classical orders, and traditional module systems.",
      order: 3,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const philosophiesTopicId = await ctx.db.insert("topics", {
      subjectId: theorySubId,
      name: "Architectural Philosophies & Master Dictums",
      description: "Design manifestos of Modernism, Postmodernism, and Philippine National Artists.",
      order: 4,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Seed Lessons under Topics (Level 3 Hierarchy)
    // Lessons under Spatial Topic
    const l1_1 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: spatialTopicId,
      name: "Point, Line, Plane, & Volume in Space",
      description: "Primary primary geometric elements forming architectural form.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l1_2 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: spatialTopicId,
      name: "Spatial Relationships & Spatial Organizations",
      description: "Centralized, linear, radial, clustered, and grid organizations.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l1_3 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: spatialTopicId,
      name: "Architectural Ordering Principles",
      description: "Axis, symmetry, hierarchy, datum, rhythm, and transformation.",
      order: 3,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // Lessons under Human Factors Topic
    const l2_1 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: humanFactorsTopicId,
      name: "Anthropometrics vs. Ergonomics",
      description: "Measurement of human body dimensions vs. efficiency and comfort in work environments.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l2_2 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: humanFactorsTopicId,
      name: "Proxemics & 4 Spatial Zones",
      description: "Intimate, personal, social, and public space zones by Edward T. Hall.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l2_3 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: humanFactorsTopicId,
      name: "Psychology Principles in Architectural Perception",
      description: "Gestalt principles of perception (figure-ground, proximity, closure, similarity).",
      order: 3,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // Lessons under Proportion Systems Topic
    const l3_1 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: proportionTopicId,
      name: "The Golden Section, Classical Orders, & Modulor",
      description: "Golden Ratio (phi = 1.618), Le Corbusier's Modulor human scale system.",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l3_2 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: proportionTopicId,
      name: "Japanese Ken System & Anthropomorphic Proportioning",
      description: "In-ma and ki-ma grid units in Japanese traditional architecture.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // Lessons under Philosophies Topic
    const l4_1 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      name: "Pioneers of Modernism & Their Famous Dictums",
      description: "Louis Sullivan ('Form follows function'), Mies van der Rohe ('Less is more'), Le Corbusier ('A house is a machine for living in').",
      order: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l4_2 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      name: "Postmodernism, Deconstructivism, & Regionalist Philosophies",
      description: "Robert Venturi ('Less is a bore'), Philip Johnson, Frank Gehry, and Critical Regionalism.",
      order: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    const l4_3 = await ctx.db.insert("lessons", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      name: "National Artists for Architecture (PH) & Design Philosophies",
      description: "Leandro Locsin, Juan Nakpil, Pablo Antonio, Francisco Mañosa, and Ildefonso Santos.",
      order: 3,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Seed Reviewer Materials linked to Lessons
    await ctx.db.insert("materials", {
      subjectId: theorySubId,
      topicId: spatialTopicId,
      lessonId: l1_3,
      title: "The Six Architectural Ordering Principles",
      description: "Guide to axis, symmetry, hierarchy, datum, rhythm, and transformation based on Francis D. K. Ching.",
      type: "article",
      content: `# Architectural Ordering Principles\n\n1. **Axis**: A line established by two points in space.\n2. **Symmetry**: Balanced distribution of equivalent forms.\n3. **Hierarchy**: Articulation of importance by size, shape, or placement.\n4. **Datum**: A line, plane, or volume that serves to gather or organize a pattern.\n5. **Rhythm**: Unifying movement characterized by repetition of elements.\n6. **Transformation**: Principle that an architectural concept can be altered through a series of discrete manipulations.`,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("materials", {
      subjectId: theorySubId,
      topicId: humanFactorsTopicId,
      lessonId: l2_2,
      title: "Edward T. Hall's Four Proxemic Zones",
      description: "Understanding human distance relationships in spatial design.",
      type: "article",
      content: `# The 4 Proxemic Spatial Zones\n\n1. **Intimate Distance**: 0 to 1.5 feet (0 - 0.45m)\n2. **Personal Distance**: 1.5 to 4 feet (0.45m - 1.2m)\n3. **Social Distance**: 4 to 12 feet (1.2m - 3.6m)\n4. **Public Distance**: 12 feet and beyond (3.6m+)`,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 6. Seed Flashcards linked to Lessons
    await ctx.db.insert("flashcards", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      lessonId: l4_1,
      front: "Who famously coined the architectural dictum 'Form Follows Function'?",
      back: "Louis Sullivan",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flashcards", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      lessonId: l4_1,
      front: "Who stated 'Less is More' in modern architecture?",
      back: "Ludwig Mies van der Rohe",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flashcards", {
      subjectId: theorySubId,
      topicId: proportionTopicId,
      lessonId: l3_1,
      front: "What proportion system did Le Corbusier develop based on the Golden Section and human body height?",
      back: "The Modulor",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("flashcards", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      lessonId: l4_3,
      front: "Which Philippine National Artist for Architecture designed the Cultural Center of the Philippines (CCP) Main Building?",
      back: "Leandro V. Locsin",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 7. Seed Board Exam Questions linked to Lessons
    const q1Id = await ctx.db.insert("questions", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      lessonId: l4_1,
      question: "Which Modernist master described a home as 'a machine for living in' (une machine-à-habiter)?",
      choices: [
        { id: "choice_a", text: "Frank Lloyd Wright" },
        { id: "choice_b", text: "Le Corbusier" },
        { id: "choice_c", text: "Walter Gropius" },
        { id: "choice_d", text: "Alvar Aalto" },
      ],
      correctChoiceId: "choice_b",
      explanation: "Le Corbusier wrote this in Vers une Architecture (1923), emphasizing functional efficiency in residential design.",
      difficulty: "easy",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const q2Id = await ctx.db.insert("questions", {
      subjectId: theorySubId,
      topicId: humanFactorsTopicId,
      lessonId: l2_2,
      question: "According to Edward T. Hall's theory of proxemics, what is the distance range for Personal Distance?",
      choices: [
        { id: "choice_a", text: "0 to 1.5 feet" },
        { id: "choice_b", text: "1.5 to 4 feet" },
        { id: "choice_c", text: "4 to 12 feet" },
        { id: "choice_d", text: "12 feet to 25 feet" },
      ],
      correctChoiceId: "choice_b",
      explanation: "Personal distance spans from 1.5 to 4 feet (approx. 0.45m to 1.2m), representing normal interaction distance between friends.",
      difficulty: "medium",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    const q3Id = await ctx.db.insert("questions", {
      subjectId: theorySubId,
      topicId: philosophiesTopicId,
      lessonId: l4_3,
      question: "Which Philippine National Artist for Architecture is celebrated for advocating Tropical Filipino Architecture using native materials like bamboo and coconut wood (e.g. Coconut Palace)?",
      choices: [
        { id: "choice_a", text: "Juan Nakpil" },
        { id: "choice_b", text: "Francisco 'Bobby' Mañosa" },
        { id: "choice_c", text: "Leandro Locsin" },
        { id: "choice_d", text: "Pablo Antonio" },
      ],
      correctChoiceId: "choice_b",
      explanation: "Francisco 'Bobby' Mañosa pioneered neo-vernacular Tropical Filipino Architecture utilizing indigenous materials.",
      difficulty: "medium",
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 8. Seed Curated Mock Board Exam
    const mockExamId = await ctx.db.insert("quizzes", {
      title: "ALE Practice Mock Exam — Theory of Architecture & Design Principles",
      description: "Curated practice examination covering architectural ordering, human factors, and famous dictums.",
      type: "mock_exam",
      subjectId: theorySubId,
      questionIds: [q1Id, q2Id, q3Id],
      timeLimitSeconds: 3600,
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
        topics: 4,
        lessons: 11,
        materials: 2,
        flashcards: 4,
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
