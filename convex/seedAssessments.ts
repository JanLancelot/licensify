import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Seeds comprehensive mock exams, drills, questions, flashcards, study notes,
 * and achievements.
 *
 * NOTE: As requested, all seeded entities contain "[Seed]" or "[Mock]" in their names
 * so they can be identified, tracked, and cleanly deleted when production content is ready.
 */
export const seedMockAssessmentsAndMaterials = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Get or create Admin user for createdBy reference
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

    // 2. Fetch existing subjects from curriculum seed
    const allSubjects = await ctx.db.query("subjects").collect();
    const allTopics = await ctx.db.query("topics").collect();
    const allLessons = await ctx.db.query("lessons").collect();

    // Helper to find a subject by name or fallback to first
    const getSubject = (keyword: string) => {
      const found = allSubjects.find((s) => s.name.toLowerCase().includes(keyword.toLowerCase()));
      return found?._id || allSubjects[0]?._id;
    };

    const hoaSubjId = getSubject("History");
    const toaSubjId = getSubject("Theory") || hoaSubjId;
    const practiceSubjId = getSubject("Practice") || hoaSubjId;
    const utilitiesSubjId = getSubject("Utilities") || hoaSubjId;
    const structSubjId = getSubject("Structural") || hoaSubjId;
    const materialsSubjId = getSubject("Materials") || hoaSubjId;
    const planningSubjId = getSubject("Planning") || hoaSubjId;
    const designSubjId = getSubject("Design") || hoaSubjId;

    if (!hoaSubjId) {
      throw new Error("Please run seedCurriculumFromExcel first to populate subjects before seeding assessments.");
    }

    // Helper to find a lesson by name
    const getLesson = (keyword: string) => {
      const found = allLessons.find((l) => l.name.toLowerCase().includes(keyword.toLowerCase()));
      return found?._id;
    };

    // 3. Clear any PREVIOUS mock seed data to prevent duplicate accumulation
    const oldQuizzes = await ctx.db.query("quizzes").collect();
    for (const q of oldQuizzes) {
      if (q.title.includes("[Mock]") || q.title.includes("[Seed]")) {
        await ctx.db.delete(q._id);
      }
    }

    const oldQuestions = await ctx.db.query("questions").collect();
    for (const q of oldQuestions) {
      if (q.question.includes("[Seed]") || q.question.includes("[Mock]")) {
        await ctx.db.delete(q._id);
      }
    }

    const oldFlashcards = await ctx.db.query("flashcards").collect();
    for (const f of oldFlashcards) {
      if (f.front.includes("[Seed]") || f.front.includes("[Mock]")) {
        await ctx.db.delete(f._id);
      }
    }

    const oldMaterials = await ctx.db.query("materials").collect();
    for (const m of oldMaterials) {
      if (m.title.includes("[Seed]") || m.title.includes("[Mock]")) {
        await ctx.db.delete(m._id);
      }
    }

    const oldAchievements = await ctx.db.query("achievements").collect();
    for (const a of oldAchievements) {
      if (a.title.includes("[Seed]") || a.title.includes("[Mock]")) {
        await ctx.db.delete(a._id);
      }
    }

    // -------------------------------------------------------------------------
    // 4. SEED QUESTIONS BANK (High-yield Architecture Licensure Examination items)
    // -------------------------------------------------------------------------
    const rawQuestionsData = [
      // AREA 1: History, Theory & Practice
      {
        subjectId: hoaSubjId,
        question: "[Seed] Which architectural order is characterized by acanthus leaf carvings on an inverted bell-shaped capital?",
        choices: [
          { id: "c1", text: "Doric Order" },
          { id: "c2", text: "Ionic Order" },
          { id: "c3", text: "Corinthian Order" },
          { id: "c4", text: "Tuscan Order" },
        ],
        correctChoiceId: "c3",
        explanation: "The Corinthian order is easily identified by its ornate capital decorated with stylized acanthus leaves and volutes.",
        difficulty: "easy" as const,
      },
      {
        subjectId: toaSubjId,
        question: "[Seed] According to Vitruvian principles in 'De Architectura', what are the three fundamental qualities of good architecture?",
        choices: [
          { id: "c1", text: "Firmitas, Utilitas, Venustas (Strength, Utility, Beauty)" },
          { id: "c2", text: "Form, Proportion, Materiality" },
          { id: "c3", text: "Symmetry, Rhythm, Hierarchy" },
          { id: "c4", text: "Context, Function, Aesthetic" },
        ],
        correctChoiceId: "c1",
        explanation: "Marcus Vitruvius Pollio asserted that a structure must exhibit Firmitas (structural integrity), Utilitas (functional efficiency), and Venustas (aesthetic beauty).",
        difficulty: "easy" as const,
      },
      {
        subjectId: practiceSubjId,
        question: "[Seed] Under RA 9266 (The Architecture Act of 2004), what is the penalty for illegal practice of architecture by unregistered individuals?",
        choices: [
          { id: "c1", text: "Fine of ₱100,000 to ₱5,000,000 and/or imprisonment of 6 months to 6 years" },
          { id: "c2", text: "Fine of ₱20,000 and warning letter" },
          { id: "c3", text: "Fine of ₱50,000 with 1 month community service" },
          { id: "c4", text: "Administrative probation for 1 year" },
        ],
        correctChoiceId: "c1",
        explanation: "Section 34 of RA 9266 penalizes unauthorized practice with a fine of not less than ₱100,000 nor more than ₱5,000,000, or imprisonment from 6 months to 6 years, or both.",
        difficulty: "medium" as const,
      },
      {
        subjectId: hoaSubjId,
        question: "[Seed] What UNESCO World Heritage Philippine Baroque church is famous for its massive buttresses designed as earthquake-proof architecture?",
        choices: [
          { id: "c1", text: "Paoay Church (San Agustin Church of Paoay, Ilocos Norte)" },
          { id: "c2", text: "Miagao Church (Iloilo)" },
          { id: "c3", text: "San Agustin Church (Intramuros, Manila)" },
          { id: "c4", text: "Santa Maria Church (Ilocos Sur)" },
        ],
        correctChoiceId: "c1",
        explanation: "Paoay Church is the foremost example of Earthquake Baroque architecture, featuring 24 enormous carved side buttresses that anchor the nave against seismic shocks.",
        difficulty: "medium" as const,
      },
      {
        subjectId: toaSubjId,
        question: "[Seed] In tropical design for humid Philippine climates, what is the primary architectural strategy to minimize solar radiation while maximizing cross ventilation?",
        choices: [
          { id: "c1", text: "Orient long building facades along the North-South axis with operable envelope louvers" },
          { id: "c2", text: "Orient long facades East-West with solid unventilated curtain walls" },
          { id: "c3", text: "Maximize East-facing fenestrations without sunshading" },
          { id: "c4", text: "Design low ceiling heights and compact deep floor plates" },
        ],
        correctChoiceId: "c1",
        explanation: "North-South orientation shields the main exterior wall planes from harsh low-angle morning and afternoon sun, while deep overhangs and louvers facilitate natural breeze paths.",
        difficulty: "medium" as const,
      },

      // AREA 2: Building Tech, Utilities & Structural
      {
        subjectId: utilitiesSubjId,
        question: "[Seed] In sanitary plumbing drainage systems, what is the minimum slope required for 3-inch (76mm) and smaller horizontal drainage pipes under the National Plumbing Code of the Philippines?",
        choices: [
          { id: "c1", text: "1% (1/8 in per foot)" },
          { id: "c2", text: "2% (1/4 in per foot)" },
          { id: "c3", text: "3% (3/8 in per foot)" },
          { id: "c4", text: "4% (1/2 in per foot)" },
        ],
        correctChoiceId: "c2",
        explanation: "The Revised National Plumbing Code mandates a minimum slope of 2% (20 mm/m or 1/4 inch per foot) for pipes 3 inches or smaller to maintain scouring velocity.",
        difficulty: "medium" as const,
      },
      {
        subjectId: structSubjId,
        question: "[Seed] In reinforced concrete design, what is the minimum concrete clear cover required for concrete cast against and permanently exposed to earth?",
        choices: [
          { id: "c1", text: "40 mm" },
          { id: "c2", text: "50 mm" },
          { id: "c3", text: "75 mm" },
          { id: "c4", text: "100 mm" },
        ],
        correctChoiceId: "c3",
        explanation: "Under NSCP / ACI standards, concrete cast against and permanently exposed to earth requires a minimum clear protective cover of 75 mm (3 inches) to protect rebar from ground moisture corrosion.",
        difficulty: "hard" as const,
      },
      {
        subjectId: materialsSubjId,
        question: "[Seed] What type of cement is specified for high early strength development in rapid architectural construction?",
        choices: [
          { id: "c1", text: "Type I (Normal Portland Cement)" },
          { id: "c2", text: "Type II (Moderate Sulfate Resistance)" },
          { id: "c3", text: "Type III (High Early Strength)" },
          { id: "c4", text: "Type IV (Low Heat of Hydration)" },
        ],
        correctChoiceId: "c3",
        explanation: "ASTM C150 Type III Portland cement is ground finer, producing higher compressive strength in 1 to 3 days compared to standard Type I.",
        difficulty: "easy" as const,
      },
      {
        subjectId: utilitiesSubjId,
        question: "[Seed] What is the standard Philippine electrical frequency and nominal low-voltage residential single-phase supply?",
        choices: [
          { id: "c1", text: "60 Hz, 230 Volts" },
          { id: "c2", text: "50 Hz, 220 Volts" },
          { id: "c3", text: "60 Hz, 120 Volts" },
          { id: "c4", text: "50 Hz, 240 Volts" },
        ],
        correctChoiceId: "c1",
        explanation: "The Philippine Electrical Code (PEC) establishes 60 Hz frequency with a nominal 230V single-phase system for standard residential service.",
        difficulty: "easy" as const,
      },
      {
        subjectId: structSubjId,
        question: "[Seed] Under ASTM/PNS steel reinforcement standards, what is the nominal diameter of a #10 (metric 32mm) deformed steel rebar?",
        choices: [
          { id: "c1", text: "25 mm" },
          { id: "c2", text: "28 mm" },
          { id: "c3", text: "32 mm" },
          { id: "c4", text: "36 mm" },
        ],
        correctChoiceId: "c3",
        explanation: "A #10 bar corresponds directly to a nominal metric diameter of 32 mm.",
        difficulty: "medium" as const,
      },

      // AREA 3: Design, Site Planning & Laws (including specialized Rule 7 & 8 computation questions)
      {
        subjectId: designSubjId,
        specializedType: "developmental_control",
        question: "[Seed] Under NBCP Rule 7 & 8, what does AMBF stand for in developmental control and zoning calculations?",
        choices: [
          { id: "c1", text: "Allowable Maximum Building Footprint" },
          { id: "c2", text: "Average Maximum Built Floor" },
          { id: "c3", text: "Approved Minimum Base Foundation" },
          { id: "c4", text: "Actual Median Boundary Form" },
        ],
        correctChoiceId: "c1",
        explanation: "AMBF is the Allowable Maximum Building Footprint, defining the maximum area at ground level that a building structure may occupy on a lot.",
        difficulty: "easy" as const,
      },
      {
        subjectId: designSubjId,
        specializedType: "developmental_control",
        question: "[Seed] A developer owns an inside lot with a Total Lot Area (TLA) of 300 sq.m in an R-2 Basic zone without firewall. If the Maximum Allowable Percentage of Site Occupancy (PSO) is 60%, what is the AMBF in square meters?",
        choices: [
          { id: "c1", text: "150 sq.m" },
          { id: "c2", text: "180 sq.m" },
          { id: "c3", text: "210 sq.m" },
          { id: "c4", text: "240 sq.m" },
        ],
        correctChoiceId: "c2",
        explanation: "AMBF = TLA × PSO = 300 sq.m × 60% (0.60) = 180 sq.m.",
        difficulty: "medium" as const,
      },
      {
        subjectId: designSubjId,
        specializedType: "developmental_control",
        question: "[Seed] For an inside lot in an R-1 zone under the Revised IRR of the National Building Code (PD 1096), what is the minimum front setback required for the structure?",
        choices: [
          { id: "c1", text: "3.00 meters" },
          { id: "c2", text: "4.50 meters" },
          { id: "c3", text: "5.00 meters" },
          { id: "c4", text: "6.00 meters" },
        ],
        correctChoiceId: "c2",
        explanation: "Table VIII.2 of NBCP Rule 8 mandates a minimum front yard setback of 4.50 meters for R-1 residential zones.",
        difficulty: "hard" as const,
      },
      {
        subjectId: planningSubjId,
        question: "[Seed] On a topographical site survey map, what does a cluster of very closely spaced contour lines indicate about the terrain?",
        choices: [
          { id: "c1", text: "A broad flat plateau" },
          { id: "c2", text: "A steep slope or vertical cliff" },
          { id: "c3", text: "A shallow drainage basin" },
          { id: "c4", text: "A uniformly leveled construction pad" },
        ],
        correctChoiceId: "c2",
        explanation: "Contour lines represent equal elevations; closely spaced lines indicate rapid elevation change over a short horizontal distance (steep slope).",
        difficulty: "easy" as const,
      },
      {
        subjectId: designSubjId,
        question: "[Seed] Under BP 344 (The Accessibility Law), what is the maximum allowable gradient / slope for a wheelchair ramp?",
        choices: [
          { id: "c1", text: "1:8 (12.5%)" },
          { id: "c2", text: "1:10 (10%)" },
          { id: "c3", text: "1:12 (8.33%)" },
          { id: "c4", text: "1:16 (6.25%)" },
        ],
        correctChoiceId: "c3",
        explanation: "BP 344 stipulates that wheelchair ramps must have a maximum slope of 1:12 (8.33%), with accessible landings provided every 6.00 meters of linear ramp run.",
        difficulty: "medium" as const,
      },
    ];

    const insertedQuestionIds: any[] = [];
    const area1QuestionIds: any[] = [];
    const area2QuestionIds: any[] = [];
    const area3QuestionIds: any[] = [];
    const specializedQuestionIds: any[] = [];

    for (const qData of rawQuestionsData) {
      const qId = await ctx.db.insert("questions", {
        subjectId: qData.subjectId,
        question: qData.question,
        choices: qData.choices,
        correctChoiceId: qData.correctChoiceId,
        explanation: qData.explanation,
        difficulty: qData.difficulty,
        specializedType: qData.specializedType,
        isPublished: true,
        createdBy: admin._id,
        createdAt: now,
        updatedAt: now,
      });

      insertedQuestionIds.push(qId);
      if (qData.specializedType === "developmental_control") {
        specializedQuestionIds.push(qId);
      }

      if (qData.subjectId === hoaSubjId || qData.subjectId === toaSubjId || qData.subjectId === practiceSubjId) {
        area1QuestionIds.push(qId);
      } else if (qData.subjectId === utilitiesSubjId || qData.subjectId === structSubjId || qData.subjectId === materialsSubjId) {
        area2QuestionIds.push(qId);
      } else {
        area3QuestionIds.push(qId);
      }
    }

    // -------------------------------------------------------------------------
    // 5. SEED QUIZZES & COMPREHENSIVE MOCK EXAMS
    // -------------------------------------------------------------------------
    // 1. Comprehensive Mock Simulation Set 1 (Area 1: HOA, TOA, Prof Practice)
    await ctx.db.insert("quizzes", {
      title: "[Mock] Comprehensive Mock Set 1",
      description: "Complete full-scale simulation covering History of Architecture, Theory of Architecture, Tropical Design, and Professional Practice.",
      type: "mock_exam",
      subjectId: hoaSubjId,
      questionIds: area1QuestionIds.length > 0 ? area1QuestionIds : insertedQuestionIds,
      timeLimitSeconds: 10800, // 3 Hours
      passingScore: 70,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Comprehensive Mock Simulation Set 2 (Area 2: Tech, Utilities, Structural)
    await ctx.db.insert("quizzes", {
      title: "[Mock] Comprehensive Mock Set 2",
      description: "Full-scale technical simulation covering Building Utilities, Building Technology, Structural Systems, and Construction Materials.",
      type: "mock_exam",
      subjectId: utilitiesSubjId,
      questionIds: area2QuestionIds.length > 0 ? area2QuestionIds : insertedQuestionIds,
      timeLimitSeconds: 10800, // 3 Hours
      passingScore: 70,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Comprehensive Mock Simulation Set 3 (Area 3: Site Planning, Design, NBCP)
    await ctx.db.insert("quizzes", {
      title: "[Mock] Comprehensive Mock Set 3",
      description: "Rigorous 7-hour architectural design and site planning simulation including NBCP Rule 7 & 8 calculations, BP 344, and Fire Code provisions.",
      type: "mock_exam",
      subjectId: designSubjId,
      questionIds: area3QuestionIds.length > 0 ? area3QuestionIds : insertedQuestionIds,
      timeLimitSeconds: 25200, // 7 Hours
      passingScore: 75,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Practice Drills
    await ctx.db.insert("quizzes", {
      title: "[Seed] Area 1: History, Theory & Practice Drill",
      description: "Targeted practice drill covering architectural heritage, design theory, and RA 9266 code provisions.",
      type: "practice",
      subjectId: hoaSubjId,
      questionIds: area1QuestionIds,
      timeLimitSeconds: 5400, // 1.5 Hours
      passingScore: 70,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("quizzes", {
      title: "[Seed] Area 2: Structural & Building Utilities Drill",
      description: "MEPFS systems, sanitary drainage slope, concrete covers, and construction technology drill.",
      type: "practice",
      subjectId: utilitiesSubjId,
      questionIds: area2QuestionIds,
      timeLimitSeconds: 5400, // 1.5 Hours
      passingScore: 70,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("quizzes", {
      title: "[Seed] Area 3: Architecture Design & Site Planning Drill",
      description: "Urban planning, BP 344 accessibility guidelines, and developmental controls.",
      type: "practice",
      subjectId: designSubjId,
      questionIds: area3QuestionIds,
      timeLimitSeconds: 7200, // 2 Hours
      passingScore: 75,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Specialized Developmental Control Computation Set
    await ctx.db.insert("quizzes", {
      title: "[Seed] Developmental Control Computation Set (Rule 7 & 8)",
      description: "NBCP Rule 7 & 8 Floor Area, Height Limit, Setback, AMBF, and PSO mathematical computation drill.",
      type: "practice",
      subjectId: designSubjId,
      specializedType: "developmental_control",
      questionIds: specializedQuestionIds.length > 0 ? specializedQuestionIds : insertedQuestionIds,
      timeLimitSeconds: 1800, // 30 mins
      passingScore: 75,
      isPublished: true,
      createdBy: admin._id,
      createdAt: now,
      updatedAt: now,
    });

    // -------------------------------------------------------------------------
    // 6. SEED FLASHCARDS
    // -------------------------------------------------------------------------
    const rawFlashcardsData = [
      {
        subjectId: hoaSubjId,
        front: "[Seed] Firmitas, Utilitas, Venustas",
        back: "The three Vitruvian principles of architecture: Strength (durability), Utility (function), and Beauty (delight).",
      },
      {
        subjectId: hoaSubjId,
        front: "[Seed] Acanthus Leaf Motif",
        back: "The signature decorative foliage carved into the capitals of the classical Corinthian architectural order.",
      },
      {
        subjectId: practiceSubjId,
        front: "[Seed] RA 9266 Architecture Act of 2004",
        back: "The law regulating the practice of architecture in the Philippines, restricting architectural document signing strictly to registered architects.",
      },
      {
        subjectId: utilitiesSubjId,
        front: "[Seed] Minimum Drainage Pipe Slope",
        back: "2% (1/4 inch per foot or 20mm per meter) minimum gradient for 3-inch and smaller horizontal soil/waste pipes.",
      },
      {
        subjectId: structSubjId,
        front: "[Seed] Concrete Cover Cast Against Earth",
        back: "75 mm (3 inches) minimum clear protective cover required when concrete is poured directly against soil.",
      },
      {
        subjectId: designSubjId,
        front: "[Seed] AMBF (Allowable Maximum Building Footprint)",
        back: "The maximum ground footprint area a structure may occupy on a lot, computed as TLA × PSO.",
      },
      {
        subjectId: designSubjId,
        front: "[Seed] BP 344 Wheelchair Ramp Slope",
        back: "1:12 (8.33%) maximum gradient, with 1.50m level landings required every 6.00 meters of continuous run.",
      },
    ];

    for (const fc of rawFlashcardsData) {
      await ctx.db.insert("flashcards", {
        subjectId: fc.subjectId,
        front: fc.front,
        back: fc.back,
        isPublished: true,
        createdBy: admin._id,
        createdAt: now,
        updatedAt: now,
      });
    }

    // -------------------------------------------------------------------------
    // 7. SEED STUDY NOTES / MATERIALS (Authentic Article Summaries)
    // -------------------------------------------------------------------------
    const rawMaterialsData = [
      {
        subjectId: hoaSubjId,
        title: "[Seed] Vitruvian Principles and Classical Orders",
        description: "Essential primer on the origins of classical architectural theory and the Five Orders.",
        content: `# Classical Architectural Theory & The Orders\n\n## 1. Vitruvian Triad\nMarcus Vitruvius Pollio established in *De Architectura* (c. 15 BC) that all architectural works must balance three interdependent qualities:\n\n* **Firmitas (Strength & Stability):** Foundations carried down to solid ground and materials chosen with careful judgment.\n* **Utilitas (Utility & Function):** Flawless arrangement of spaces and unobstructed circulation appropriate to human usage.\n* **Venustas (Beauty & Proportion):** Aesthetic harmony governed by mathematical proportion and the human scale.\n\n## 2. The Classical Orders\n* **Doric:** Masculine, sturdy, unadorned frieze with triglyphs and metopes.\n* **Ionic:** Graceful, feminine proportions with signature double spiral volutes.\n* **Corinthian:** Slender column crowned by stylized acanthus leaves.\n* **Composite & Tuscan:** Roman modifications providing structural simplicity and heightened decoration.`,
      },
      {
        subjectId: designSubjId,
        title: "[Seed] NBCP Rule 7 & 8 Development Controls Summary",
        description: "Formulas and regulatory tables for AMBF, BHL, TGFA, and site setback calculations.",
        content: `# NBCP Rule 7 & 8: Zoning & Developmental Controls\n\n## Core Definitions & Formulas\n* **TLA (Total Lot Area):** Total horizontal area bounded by property lines.\n* **PSO (Percentage of Site Occupancy):** Portion of the lot covered by building footprint.\n* **AMBF (Allowable Maximum Building Footprint):** Calculated as \`AMBF = TLA × PSO\`.\n* **USA (Unpaved Surface Area):** Required natural permeable ground area for stormwater percolation.\n* **ISA (Impervious Surface Area):** Paved outdoor walkways and carports.\n* **TOSL (Total Open Space within Lot):** Calculated as \`TOSL = USA + ISA = 100% - PSO\`.\n\n## Setback Requirements (R-1 Zone)\n* **Front Yard:** Minimum 4.50 meters.\n* **Side Yards:** Minimum 2.00 meters each.\n* **Rear Yard:** Minimum 2.00 meters.`,
      },
      {
        subjectId: utilitiesSubjId,
        title: "[Seed] Sanitary Drainage & Plumbing System Guidelines",
        description: "National Plumbing Code of the Philippines key sizing provisions and drainage gradients.",
        content: `# National Plumbing Code Provisions\n\n## 1. Pipe Sizing & Slopes\n* Horizontal drainage pipes 3 inches (76mm) or smaller: **2% minimum slope** (1/4 in/ft).\n* Pipes 4 inches (102mm) and larger: **1% minimum slope** (1/8 in/ft) permitted with local authority approval.\n\n## 2. Venting Requirements\n* Every plumbing trap must be protected by an approved atmospheric vent to prevent trap seal siphonage.\n* Minimum vent pipe size: Never less than 1-1/4 inches (32mm) or half the diameter of the drain served.`,
      },
    ];

    for (const mat of rawMaterialsData) {
      await ctx.db.insert("materials", {
        subjectId: mat.subjectId,
        title: mat.title,
        description: mat.description,
        type: "article",
        content: mat.content,
        isPublished: true,
        createdBy: admin._id,
        createdAt: now,
        updatedAt: now,
      });
    }

    // -------------------------------------------------------------------------
    // 8. SEED SYSTEM ACHIEVEMENTS
    // -------------------------------------------------------------------------
    const rawAchievementsData = [
      {
        title: "[Seed] Code Master",
        category: "Rule 7 & 8",
        description: "Complete 5 developmental control calculation drills with 80%+ accuracy.",
        iconName: "Trophy",
        bg: "#FEF3C7",
        darkBg: "rgba(245, 158, 11, 0.2)",
        iconColor: "#D97706",
        criteriaType: "rule7_8",
        targetValue: 5,
        order: 1,
      },
      {
        title: "[Seed] Rapid Recall",
        category: "Flashcard Drills",
        description: "Review and complete 5 custom or premade flashcard decks.",
        iconName: "Zap",
        bg: "#EDE9FE",
        darkBg: "rgba(139, 92, 246, 0.2)",
        iconColor: "#7C3AED",
        criteriaType: "flashcard_decks",
        targetValue: 5,
        order: 2,
      },
      {
        title: "[Seed] 14-Day Streak",
        category: "Consistency",
        description: "Log into Licensify and practice questions for 14 consecutive days.",
        iconName: "Flame",
        bg: "#FFEDD5",
        darkBg: "rgba(249, 115, 22, 0.2)",
        iconColor: "#EA580C",
        criteriaType: "streak",
        targetValue: 14,
        order: 3,
      },
      {
        title: "[Seed] Area 1 Specialist",
        category: "Mock Exam",
        description: "Score 75% or higher on the Area 1 Comprehensive Mock Simulation.",
        iconName: "Star",
        bg: "#E0F2FE",
        darkBg: "rgba(14, 165, 233, 0.2)",
        iconColor: "#0284C7",
        criteriaType: "area1_exam",
        targetValue: 1,
        order: 4,
      },
      {
        title: "[Seed] Perfectionist",
        category: "100% Score",
        description: "Achieve a perfect 100% score on any practice drill session.",
        iconName: "Award",
        bg: "#FCE7F3",
        darkBg: "rgba(236, 72, 153, 0.2)",
        iconColor: "#DB2777",
        criteriaType: "perfect_score",
        targetValue: 1,
        order: 5,
      },
    ];

    for (const ach of rawAchievementsData) {
      await ctx.db.insert("achievements", {
        title: ach.title,
        category: ach.category,
        description: ach.description,
        iconName: ach.iconName,
        bg: ach.bg,
        darkBg: ach.darkBg,
        iconColor: ach.iconColor,
        criteriaType: ach.criteriaType,
        targetValue: ach.targetValue,
        order: ach.order,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      questionsCount: rawQuestionsData.length,
      quizzesCount: 7,
      flashcardsCount: rawFlashcardsData.length,
      materialsCount: rawMaterialsData.length,
      achievementsCount: rawAchievementsData.length,
    };
  },
});

/**
 * Clean-up Mutation: Purges all items seeded with "[Seed]" or "[Mock]"
 * in their titles or question text. Leaves syllabus hierarchy intact.
 */
export const deleteMockSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    let deletedCount = 0;

    // 1. Quizzes
    const quizzes = await ctx.db.query("quizzes").collect();
    for (const q of quizzes) {
      if (q.title.includes("[Mock]") || q.title.includes("[Seed]")) {
        await ctx.db.delete(q._id);
        deletedCount++;
      }
    }

    // 2. Questions
    const questions = await ctx.db.query("questions").collect();
    for (const q of questions) {
      if (q.question.includes("[Seed]") || q.question.includes("[Mock]")) {
        await ctx.db.delete(q._id);
        deletedCount++;
      }
    }

    // 3. Flashcards
    const flashcards = await ctx.db.query("flashcards").collect();
    for (const f of flashcards) {
      if (f.front.includes("[Seed]") || f.front.includes("[Mock]")) {
        await ctx.db.delete(f._id);
        deletedCount++;
      }
    }

    // 4. Materials
    const materials = await ctx.db.query("materials").collect();
    for (const m of materials) {
      if (m.title.includes("[Seed]") || m.title.includes("[Mock]")) {
        await ctx.db.delete(m._id);
        deletedCount++;
      }
    }

    // 5. Achievements
    const achievements = await ctx.db.query("achievements").collect();
    for (const a of achievements) {
      if (a.title.includes("[Seed]") || a.title.includes("[Mock]")) {
        await ctx.db.delete(a._id);
        deletedCount++;
      }
    }

    return {
      success: true,
      message: `Cleaned up ${deletedCount} seed/mock records.`,
      deletedCount,
    };
  },
});

/**
 * Seed Mutation: Creates a sample subject with a complete, rich-content lesson and material.
 */
export const seedSampleFullLesson = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 0. Get or create Admin user
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

    // 1. Create or find Sample Subject
    let subject = await ctx.db
      .query("subjects")
      .filter((q) => q.eq(q.field("name"), "Architectural Building Laws & NBCP"))
      .first();

    if (!subject) {
      const subjectId = await ctx.db.insert("subjects", {
        createdBy: admin._id,
        name: "Architectural Building Laws & NBCP",
        description: "National Building Code of the Philippines (P.D. 1096), Fire Code (R.A. 9514), and Architectural Practice Laws.",
        order: 99,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
      subject = (await ctx.db.get(subjectId))!;
    }

    // 2. Create Topic under Subject
    let topic = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
      .filter((q) => q.eq(q.field("name"), "NBCP Rule 7 & 8: Open Space & Building Bulk Controls"))
      .first();

    if (!topic) {
      const topicId = await ctx.db.insert("topics", {
        subjectId: subject._id,
        name: "NBCP Rule 7 & 8: Open Space & Building Bulk Controls",
        description: "Formulas and developmental control limits governing AMBF, PSO, TOSL, BHL, and minimum setbacks.",
        order: 1,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
      topic = (await ctx.db.get(topicId))!;
    }

    // 3. Create Sample Lesson under Topic
    let lesson = await ctx.db
      .query("lessons")
      .withIndex("by_topic_and_order", (q) => q.eq("topicId", topic._id))
      .filter((q) => q.eq(q.field("name"), "Rule 7 & 8 Masterclass: AMBF, PSO, TOSL, and Setbacks"))
      .first();

    if (!lesson) {
      const lessonId = await ctx.db.insert("lessons", {
        subjectId: subject._id,
        topicId: topic._id,
        name: "Rule 7 & 8 Masterclass: AMBF, PSO, TOSL, and Setbacks",
        description: "Comprehensive step-by-step calculations for Total Lot Area, Allowable Maximum Building Footprint, and required Open Spaces.",
        order: 1,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
      lesson = (await ctx.db.get(lessonId))!;
    }

    // 4. Create Material linked to Lesson with rich markdown content and bullet points
    const existingMaterial = await ctx.db
      .query("materials")
      .filter((q) => q.eq(q.field("lessonId"), lesson._id))
      .first();

    const fullContent = `# Rule 7 & 8: Building Bulk & Development Controls

## Core Concepts & Formulas
The National Building Code of the Philippines (P.D. 1096) Rule 7 and 8 mandate precise zoning limits to ensure proper light, ventilation, and structural site safety.

* **AMBF (Allowable Maximum Building Footprint):** Calculated as \`AMBF = TLA × PSO\`. It defines the maximum ground area a building structure can cover.
* **PSO (Percentage of Site Occupancy):** Maximum percentage of Total Lot Area (TLA) permitted for building coverage (e.g., 60% for R-1 residential inside lot).
* **TOSL (Total Open Space within Lot):** Composed of Unpaved Surface Area (USA) and Impervious Surface Area (ISA). Calculated as \`TOSL = 100% - PSO = USA + ISA\`.
* **USA (Unpaved Surface Area):** Required natural permeable soil area for rain percolation (minimum 20% of TLA for R-1).
* **ISA (Impervious Surface Area):** Paved outdoor areas like driveways, carports, and paved courtyards (maximum 20% of TLA for R-1).

## Setback Requirements for R-1 Zoning
* **Front Setback:** Minimum 4.50 meters measured from property line to building wall.
* **Side Setbacks:** Minimum 2.00 meters required on both sides for unabutted structures.
* **Rear Setback:** Minimum 2.00 meters measured from rear property boundary line.
* **Building Height Limit (BHL):** R-1 zones are limited to 3 storeys or a maximum height of 10.00 meters above established grade level.`;

    if (!existingMaterial) {
      await ctx.db.insert("materials", {
        subjectId: subject._id,
        topicId: topic._id,
        lessonId: lesson._id,
        title: "Rule 7 & 8 Study Notes & Formulas",
        description: "Complete guide to AMBF, PSO, TOSL calculations, setback rules, and BHL height limits under P.D. 1096.",
        type: "article",
        content: fullContent,
        isPublished: true,
        createdBy: admin._id,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingMaterial._id, {
        content: fullContent,
        updatedAt: now,
      });
    }

    return {
      success: true,
      subjectId: subject._id,
      topicId: topic._id,
      lessonId: lesson._id,
      message: "Sample subject, topic, lesson, and full content material seeded successfully!",
    };
  },
});

