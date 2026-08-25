import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Auto-generated seed mutation from Excel syllabus import.
 */
export const seedCurriculumFromExcel = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // 0. System Admin User (Required for createdBy subject reference)
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


        // 1. Clear existing 3-tier hierarchy
        const oldLessons = await ctx.db.query("lessons").collect();
        for (const l of oldLessons) await ctx.db.delete(l._id);
        const oldTopics = await ctx.db.query("topics").collect();
        for (const t of oldTopics) await ctx.db.delete(t._id);
        const oldSubjects = await ctx.db.query("subjects").collect();
        for (const s of oldSubjects) await ctx.db.delete(s._id);

        // 2. Insert Subjects, Topics & Lessons
        const subj_1 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "1_History of Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_1 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Architectural History",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_1,
            name: "History of Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_1,
            name: "Origin of Architecture",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_2 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Prehistoric Architecture",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_2,
            name: "Prehistoric Architectural Development",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_2,
            name: "Megalithic Architecture",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_2,
            name: "Prehistoric Structures",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_3 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Egyptian Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_3,
            name: "Egyptian Civilization",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_3,
            name: "Mastaba, Pyramid & Mortuary",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_3,
            name: "Egyptian Temples, Columns, & Symbolism",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_4 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "West Asiatic Architecture",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_4,
            name: "Mesopotamia Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_4,
            name: "Assyrian & Persian Architecture",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_4,
            name: "West Asiatic Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_5 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Greek Architecture",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_5,
            name: "Greek Civilization",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_5,
            name: "Greek Orders",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_5,
            name: "Civic Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_5,
            name: "Greek Temple Planning",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_6 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Roman Architecture",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_6,
            name: "Roman Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_6,
            name: "Roman Orders",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_6,
            name: "Roman Innovations",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_6,
            name: "Basilica, Forum, Amphitheater & Thermae",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_6,
            name: "Pantheon, Colosseum & Roman Examples",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_7 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Early Christian Architecture",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_7,
            name: "Christian Church",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_7,
            name: "Early Christian Basilica: Plan & Elements",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_7,
            name: "Early Christian Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_8 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Byzantine Architecture",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_8,
            name: "Byzantine Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_8,
            name: "Centralized Plans, Domes & Pendentives",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_8,
            name: "Byzantine Mosaics, Light & Ornament",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_8,
            name: "Hagia Sophia: Structure & Architectural Identity",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_9 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Romanesque Architecture",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_9,
            name: "Romanesque Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_9,
            name: "Romanesque Structural Characteristics",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_9,
            name: "Romanesque Church Plan, Massing & Openings",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_9,
            name: "Romanesque vs. Early Christian Architecture",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_10 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Gothic Architecture",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_10,
            name: "Gothic Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_10,
            name: "Pointed Arch, Ribbed Vault & Flying Buttress",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_10,
            name: "Gothic Cathedral: Verticality & Light",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_10,
            name: "Gothic vs. Romanesque",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_11 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Renaissance Architecture",
            order: 11,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_11,
            name: "Renaissance Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_11,
            name: "Renaissance Proportion, Symmetry & Geometry",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_11,
            name: "Early, High & Late Renaissance Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_11,
            name: "Brunelleschi, Alberti, Bramante & Palladio",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_12 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "19th–20th Century Great Britain",
            order: 12,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_12,
            name: "Industrial Revolution & British Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_12,
            name: "Arts and Crafts Movement",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_12,
            name: "British Modernism & Industrial Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_13 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Africa, Australia & New Zealand",
            order: 13,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_13,
            name: "Indigenous & Environmental Influences",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_13,
            name: "Colonial & Modern Architectural Development",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_13,
            name: "Climate, Culture & Regional Architectural Identity",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_14 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Continental European Architecture",
            order: 14,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_14,
            name: "Neoclassicism & Historicism",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_14,
            name: "Art Nouveau: Nature, Ornament & New Materials",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_14,
            name: "Art Deco: Geometry & Modern Luxury",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_14,
            name: "Modernism: Function, Technology & Form",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_14,
            name: "Bauhaus, International Style & Functionalism",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_15 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Architecture of the Americas",
            order: 15,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_15,
            name: "Pre-Columbian Architecture of the Americas",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_15,
            name: "Colonial Architecture in the Americas",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_15,
            name: "American Modern Architecture & Skyscraper Development",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_15,
            name: "Wright, Sullivan & American Architectural Innovation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_16 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Asian & Pacific Architecture",
            order: 16,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_16,
            name: "Indian Architecture: Stupa, Temple & Cave Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_16,
            name: "Chinese Architecture: Courtyard, Axis & Timber",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_16,
            name: "Japanese Architecture: Simplicity, Modularity & Nature",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_16,
            name: "Islamic Architecture in Asia",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_16,
            name: "Southeast Asian & Pacific Regional Architecture",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_17 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Philippine Architectural History",
            order: 17,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Precolonial Philippine Architecture",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Indigenous Philippine House Forms",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Spanish Colonial Architecture",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Baroque Churches & Philippine Adaptation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Bahay na Bato: Structure, Materials & Climate",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "American Colonial Architecture",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Art Deco & Prewar Philippine Architecture",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Postwar Modernism in the Philippines",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_17,
            name: "Contemporary & Neo-Vernacular Philippine Architecture",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_18 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Philippine Architectural Legacies",
            order: 18,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_18,
            name: "Identifying Major Philippine Architectural Legacies",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_18,
            name: "Architect–Building Associations",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_18,
            name: "Regionalism, Vernacularism & Filipino Identity",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_19 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Preservation, Conservation & Restoration",
            order: 19,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_19,
            name: "Preservation vs. Conservation vs. Restoration",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_19,
            name: "Adaptive Reuse & Heritage Management",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_19,
            name: "Philippine Heritage Protection Framework",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_19,
            name: "Reading Heritage Buildings Through Context",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_1_20 = await ctx.db.insert("topics", {
            subjectId: subj_1,
            name: "Pillars of Philippine Architecture",
            order: 20,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Juan Arellano & Filipino Architectural Legacy",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Juan Nakpil & Philippine Modernism",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Pablo Antonio & Art Deco",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Fernando Ocampo & Modern Philippine Architecture",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Leandro Locsin & Monumental Modernism",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Ildefonso Santos & Philippine Landscape Architecture",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_1,
            topicId: top_1_20,
            name: "Francisco Mañosa & Neo-Vernacularism",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_2 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "2_Planning",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_1 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Foundations of Planning",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_1,
            name: "Planning: Definition, Purpose & Scope",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_1,
            name: "Classification of Planning: Physical, Economic, Social & Environmental",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_1,
            name: "Evolution of Planning: From Physical Planning to Integrated Planning",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_1,
            name: "The General Planning Process: From Data Gathering to Implementation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_2 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Planning Concepts & Theories",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_2,
            name: "Planning Scales: Site, Community, City, Regional & National",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_2,
            name: "Rational-Comprehensive, Incremental & Advocacy Planning",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_2,
            name: "Systems Approach, Ecological Planning & Participatory Planning",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_3 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Urban & Regional Planning",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_3,
            name: "City–Region Relationships & Hierarchy of Settlements",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_3,
            name: "Urbanization, Suburbanization, Sprawl & Metropolitan Growth",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_3,
            name: "Central Place, Concentric Zone, Sector & Multiple-Nuclei Models",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_3,
            name: "Regional Planning: Resources, Growth Centers & Development Corridors",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_4 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Comprehensive Planning",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_4,
            name: "Comprehensive Planning: Purpose, Components & Structure",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_4,
            name: "Vision, Goals, Objectives, Policies & Strategies",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_4,
            name: "Data Gathering, Analysis, Forecasting & Plan Formulation",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_4,
            name: "Plan Implementation, Monitoring, Evaluation & Updating",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_5 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Land Use Planning",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_5,
            name: "Land Use: Residential, Commercial, Industrial, Institutional & Open Space",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_5,
            name: "Land Use Allocation, Compatibility & Conflict",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_5,
            name: "Zoning, Zoning Ordinance & Development Controls",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_5,
            name: "RA 7160: LGU Powers Over Land Use & Comprehensive Land Use Plans",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_6 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Urban Design",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_6,
            name: "Urban Design vs Architecture vs Urban Planning",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_6,
            name: "Kevin Lynch: Paths, Edges, Districts, Nodes & Landmarks",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_6,
            name: "Figure-Ground, Solid-Void & Urban Spatial Structure",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_6,
            name: "Imageability, Legibility, Identity & Sense of Place",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_7 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Urbanization & Social Relationships",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_7,
            name: "Urban Growth, Density & Population Distribution",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_7,
            name: "Social Stratification, Community Structure & Spatial Relationships",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_7,
            name: "Mixed-Use, Walkability, Accessibility & Livability",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_8 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Housing & Human Settlements",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_8,
            name: "Human Settlements: Definition, Classification & Components",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_8,
            name: "Housing Types, Tenure & Settlement Patterns",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_8,
            name: "RA 7279: Urban Development & Housing Act",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_8,
            name: "BP 220: Economic & Socialized Housing Standards",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_9 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Housing Development & Finance",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_9,
            name: "Housing Policies, Programs & Government Intervention",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_9,
            name: "Housing Production: Public, Private & Community-Based Approaches",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_9,
            name: "Housing Finance, Affordability & the 30% Income Benchmark",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_10 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Site Analysis",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_10,
            name: "Site Inventory: Physical, Environmental & Man-Made Factors",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_10,
            name: "Site Suitability: Opportunities, Constraints & Development Potential",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_10,
            name: "Topography, Slope, Drainage, Soil & Natural Hazards",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_10,
            name: "Climate, Solar Orientation, Wind & Microclimate",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_11 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Site Planning & Development",
            order: 11,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_11,
            name: "Site Planning Principles: Function, Ecology, Aesthetics & Human Behavior",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_11,
            name: "Circulation: Pedestrian, Vehicular, Service & Emergency Movement",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_11,
            name: "Site Zoning, Building Placement, Open Space & Activity Areas",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_11,
            name: "SPP 203.5: Site & Physical Planning Services",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_2_12 = await ctx.db.insert("topics", {
            subjectId: subj_2,
            name: "Landscape Architecture & Planning Integration",
            order: 12,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_12,
            name: "Landscape Design: Functional, Ecological & Aesthetic Roles",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_12,
            name: "Planting, Open Space, Buffers & Green Infrastructure",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_12,
            name: "Physical, Aesthetic, Ecological & Socio-Psychological Site Considerations",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_2,
            topicId: top_2_12,
            name: "Management & Maintenance as Planning Considerations",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_3 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "3_Building Utility",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_1 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Water Supply Systems",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Water Supply Fundamentals: Sources, Treatment & Potability Standards",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Direct, Indirect, Upfeed & Downfeed Water Distribution Systems",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Water Demand Calculations & Plumbing Fixture Unit (PFU) Concepts",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Water Storage Facilities: Cisterns, Reservoirs & Elevated Tanks",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Pumps, Hydropneumatic Tanks & Pressure Distribution Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_1,
            name: "Hot Water Supply Systems: Centralized vs Point-of-Use Heaters",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_2 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Plumbing & Sanitary Systems",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "National Plumbing Code of the Philippines: Scope & Key Definitions",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Plumbing System Components: Water Supply, Drainage & Vent Systems",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Soil Pipes, Waste Pipes & House Drains Explained",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Venting Systems: Stack Vent, Vent Stack & Circuit Vent Principles",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Plumbing Fixtures, Fixture Clearances & Accessibility Requirements",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Traps, Trap Seals & Backflow Prevention Devices",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Cleanouts: Locations, Functions & Code Requirements",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Septic Tanks: Components, Sizing Principles & Effluent Disposal",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_2,
            name: "Sanitary Sewerage Systems vs On-Site Disposal Systems",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_3 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Storm Drainage Systems",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_3,
            name: "Roof Drains, Area Drains & Catch Basins",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_3,
            name: "Gutters, Leaders & Downspout Design Principles",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_3,
            name: "Scuppers, Overflow Drains & Emergency Roof Drainage",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_3,
            name: "Rainwater Harvesting Systems & Storage Applications",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_4 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Fire Protection Systems",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "RA 9514 Fire Code: Fire Protection Fundamentals",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Fire Triangle, Fire Tetrahedron & Classes of Fire",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Portable Fire Extinguishers: Types & Applications",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Automatic Fire Sprinkler Systems: Components & Operation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Wet Pipe, Dry Pipe, Pre-Action & Deluge Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Standpipe Systems & Fire Hose Cabinets",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Fire Detection Systems: Smoke, Heat & Flame Detectors",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Fire Alarm Systems, Notification Devices & Control Panels",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_4,
            name: "Emergency Power & Smoke Control Systems",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_5 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Electrical Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Philippine Electrical Code (PEC): Basic Terminologies & Applications",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Electrical Service Entrance, Meters & Main Disconnects",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Feeders, Branch Circuits & Distribution Panels",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Circuit Protection: Fuses, Breakers & Ground Fault Devices",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Grounding, Bonding & Electrical Safety Fundamentals",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Lighting Fundamentals: Lumens, Lux & Foot-Candles",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Lighting Systems: Incandescent, Fluorescent, HID & LED",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Emergency Lighting & Exit Signage Requirements",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_5,
            name: "Generator Systems, ATS & Backup Power Applications",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_6 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "HVAC & Mechanical Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "HVAC Fundamentals: Heating, Ventilation & Air Conditioning",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Human Comfort Factors: Temperature, Humidity & Air Movement",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Air Conditioning Processes & Refrigeration Cycle Basics",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Air Distribution Systems: Ducts, Dampers & Diffusers",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Ventilation Standards & Indoor Air Quality Requirements",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Split-Type, Packaged & Window-Type Air Conditioning Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_6,
            name: "Chillers, Cooling Towers & Centralized HVAC Systems",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_7 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Vertical Transportation Systems",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Elevators: Types, Components & Operating Principles",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Hydraulic vs Traction Elevators",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Elevator Hoistways, Machine Rooms & Safety Devices",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Elevator Planning, Zoning & Handling Capacity",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Escalators: Components, Operation & Safety Requirements",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_7,
            name: "Moving Walks & Special Transportation Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_8 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Communications Systems",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_8,
            name: "Building Communication Systems Overview",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_8,
            name: "Telephone Systems & Telecommunications Rooms",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_8,
            name: "Structured Cabling Systems: MDF, IDF & Backbone Cabling",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_8,
            name: "Data Networks, Fiber Optics & Internet Infrastructure",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_8,
            name: "Building Management Systems (BMS) & Smart Building Controls",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_9 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Security & Safety Systems",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_9,
            name: "CCTV Surveillance Systems: Components & Layout Planning",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_9,
            name: "Access Control Systems: Card Readers, Biometrics & Entry Controls",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_9,
            name: "Intrusion Detection & Alarm Systems",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_9,
            name: "Security System Integration in Building Design",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_10 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Gas & Specialized Utility Systems",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_10,
            name: "LPG Systems: Storage, Distribution & Safety Requirements",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_10,
            name: "Gas Piping Components, Regulators & Shutoff Devices",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_10,
            name: "Fuel Storage Systems for Buildings",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_10,
            name: "Medical Gas Systems & Healthcare Facility Utilities",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_3_11 = await ctx.db.insert("topics", {
            subjectId: subj_3,
            name: "Sustainable Building Utilities",
            order: 11,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Green Building Principles for Utility Systems",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Energy-Efficient Lighting Design Strategies",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Water Conservation Technologies & Low-Flow Fixtures",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Greywater Recycling & Water Reuse Systems",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Renewable Energy Integration: Solar, Wind & Hybrid Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_3,
            topicId: top_3_11,
            name: "Net-Zero and High-Performance Building Utility Concepts",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_4 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "4_Building Technology",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_1 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Building Materials Fundamentals",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_1,
            name: "Properties of Construction Materials: Strength, Durability & Workability",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_1,
            name: "Material Testing Methods: Compression, Tension & Shear Tests",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_1,
            name: "CSI MasterFormat & Construction Material Specifications",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_1,
            name: "Thermal, Acoustic & Fire-Resistance Properties of Materials",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_1,
            name: "Sustainable & Green Building Materials Applications",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_2 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Concrete Construction",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Portland Cement Types I–V: Uses & Characteristics",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Concrete Ingredients: Cement, Aggregates, Water & Admixtures",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Water-Cement Ratio & Concrete Strength Development",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Concrete Mix Proportions & Slump Test Fundamentals",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Reinforced Concrete: Concrete vs Steel Functions",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Reinforcing Bars: Sizes, Grades & Identification Marks",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Formwork, Falsework & Shoring Systems",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_2,
            name: "Concrete Defects: Honeycombing, Segregation & Cold Joints",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_3 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Masonry Construction",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "Concrete Hollow Blocks (CHB): Types, Sizes & Applications",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "CHB Wall Construction & Reinforcement Practices",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "Mortar Types: Cement, Lime & Masonry Mortars",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "Brick Masonry Bonds: Running, English & Flemish Bond",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "Masonry Grouting & Reinforcement Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_3,
            name: "Stone Masonry Construction Methods & Terminology",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_4 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Wood Construction",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Hardwood vs Softwood: Identification & Applications",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Lumber Grades, Sizes & Standard Dimensions",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Moisture Content, Shrinkage & Wood Movement",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Wood Defects: Knots, Checks, Splits & Warping",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Wood Seasoning: Air-Dried vs Kiln-Dried Lumber",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Traditional Wood Framing Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_4,
            name: "Engineered Wood Products: Plywood, MDF, OSB & Laminates",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_5 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Steel Construction",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Structural Steel Shapes: W, I, C, HSS & Angle Sections",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Steel Properties: Strength, Ductility & Elasticity",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Bolted Connections: Components & Applications",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Welded Connections: Types & Construction Methods",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Steel Trusses: Components & Load Transfer",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Long-Span Steel Structural Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Corrosion Protection: Galvanizing & Protective Coatings",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_5,
            name: "Fireproofing Methods for Structural Steel",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_6 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Structural Systems for Architects",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Structural Load Types: Dead, Live, Wind & Seismic Loads",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Load Path: How Buildings Transfer Loads to Foundations",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Columns: Types, Functions & Structural Behavior",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Beams & Girders: Functions & Differences",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "One-Way Slab vs Two-Way Slab Systems",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Foundations: Isolated, Combined & Strap Footings",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Raft Foundations & Mat Foundations",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_6,
            name: "Shear Walls, Braced Frames & Core Systems",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_7 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Roof Construction Systems",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Forms: Gable, Hip, Gambrel, Mansard & Shed Roofs",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Framing Components: Rafters, Purlins & Ridge Boards",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Trusses: Howe, Pratt, Warren & Fink Types",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Coverings: GI Sheets, Tiles & Shingles",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Flashing, Valleys & Waterproofing Details",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_7,
            name: "Roof Drainage Systems & Slope Requirements",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_8 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Doors, Windows & Glazing",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Door Types: Flush, Panel, Sliding & Folding Doors",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Door Frames, Jambs, Heads & Threshold Components",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Architectural Hardware: Hinges, Locks & Closers",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Window Types: Awning, Casement, Sliding & Fixed",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Glass Types: Float, Tempered, Laminated & Wired Glass",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Curtain Wall Systems vs Storefront Systems",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_8,
            name: "Aluminum, UPVC & Steel Window Systems",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_9 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Finishes & Interior Construction",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Flooring Materials: Ceramic Tile, Granite & Marble",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Wood Flooring, Vinyl & Resilient Floor Materials",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Wall Finishes: Paint, Plaster & Decorative Coatings",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Cladding Systems: Stone, Metal & Composite Panels",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Ceiling Systems: Gypsum Board & Suspended Ceilings",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Acoustic Ceiling Systems & Sound Control Materials",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_9,
            name: "Modular Partitions & Drywall Construction",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_10 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Waterproofing & Damp Proofing",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Sources of Moisture Intrusion in Buildings",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Damp Proofing vs Waterproofing Systems",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Built-Up Membrane Waterproofing Systems",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Liquid-Applied Waterproofing Systems",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Basement & Retaining Wall Waterproofing Methods",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_10,
            name: "Expansion Joints, Control Joints & Sealants",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_11 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Stairs, Ramps & Accessibility",
            order: 11,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "Stair Terminology: Rise, Run, Nosing & Landing",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "PD 1096 Stair Design Requirements",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "Straight-Run, Doglegged & Open-Well Stair Types",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "BP 344 Ramp Design Standards",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "Handrails, Guards & Protective Barriers",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_11,
            name: "Accessible Routes & Universal Design Principles",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_4_12 = await ctx.db.insert("topics", {
            subjectId: subj_4,
            name: "Construction Methods & Project Execution",
            order: 12,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Site Clearing, Grubbing & Demolition Activities",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Building Layout, Batter Boards & Excavation Works",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Foundation Construction Sequence & Procedures",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Superstructure Construction: Columns, Beams & Slabs",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Building Enclosure Construction: Walls & Roofs",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Construction Specifications: General vs Technical Specs",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Bill of Quantities (BOQ) & Material Take-Off Basics",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_4,
            topicId: top_4_12,
            name: "Occupational Safety & Health Standards in Construction",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_5 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "5_Professional Practice (1)",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_5_1 = await ctx.db.insert("topics", {
            subjectId: subj_5,
            name: "Architectural Laws & RA 9266",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "Architecture Act of 2004 (RA 9266): Purpose, Scope & Key Definitions",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "RA 9266 IRR: Registration, Licensure & Professional Practice Requirements",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "Scope of Architectural Practice: What an Architect May Legally Perform",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "Foreign Architects: Limitations, Reciprocity & Temporary Practice",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "Illegal Practice, Prohibited Acts & Penalties Under RA 9266",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_1,
            name: "Corporate, Partnership & Group Practice of Architecture",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_5_2 = await ctx.db.insert("topics", {
            subjectId: subj_5,
            name: "Professional Regulation & Ethics",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_2,
            name: "PRC vs. PRBOA: Powers, Functions & Regulatory Authority",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_2,
            name: "Architect's Credo: Core Principles of Professional Conduct",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_2,
            name: "Code of Ethical Conduct: Duties to Clients & the Public",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_2,
            name: "Ethical Duties to Contractors, Consultants & Fellow Architects",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_2,
            name: "Conflict of Interest, Professional Misconduct & Disciplinary Liability",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_5_3 = await ctx.db.insert("topics", {
            subjectId: subj_5,
            name: "Related Building Laws & Professional Liability",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_3,
            name: "PD 1096: National Building Code Purpose, Scope & Permit Framework",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_3,
            name: "PD 1096 Referral Codes: How Allied Laws Apply to Building Design",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_3,
            name: "BP 344: Accessibility Requirements for Buildings & Public Spaces",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_3,
            name: "RA 9514: Fire Code, Fire Safety & Life Safety Requirements",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_3,
            name: "Civil Code Article 1723: 15-Year Structural Liability",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_5_4 = await ctx.db.insert("topics", {
            subjectId: subj_5,
            name: "Pre-Design Services — SPP Doc 201",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "SPP Doc 201: Scope of Pre-Design Services",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Architectural Programming: Defining Users, Spaces & Project Requirements",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Space Planning & Area Programming Fundamentals",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Feasibility Studies: Technical, Financial & Operational Analysis",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Site Selection & Site Analysis: Constraints, Opportunities & Context",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Environmental Impact, Land Use & Development Regulations",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_5,
            topicId: top_5_4,
            name: "Promotional Services & Pre-Design Compensation Methods",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_6 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "5_Professional Practice (2)",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_6_1 = await ctx.db.insert("topics", {
            subjectId: subj_6,
            name: "Regular Design Services — SPP Doc 202",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "SPP Doc 202: Scope of Regular Architectural Design Services",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Schematic Design: From Program to Initial Design Concept",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Design Development: Refining Systems, Materials & Project Requirements",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Contract Documents: Working Drawings & Construction Information",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Technical Specifications: Defining Materials, Quality & Workmanship",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Bidding & Negotiation Phase: Architect's Role Before Construction",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_1,
            name: "Construction Phase Administration & Post-Construction Duties",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_6_2 = await ctx.db.insert("topics", {
            subjectId: subj_6,
            name: "Methods of Compensation & Architectural Fees",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_2,
            name: "Percentage of Project Construction Cost (PCC): Fee Computation Basics",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_2,
            name: "Multiple of Direct Personnel Expense (MDPE): Matrix & Computation",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_2,
            name: "Lump Sum, Retainer & Other Alternative Compensation Methods",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_2,
            name: "Billing Schedules, Progress Payments & Fee Allocation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_2,
            name: "Regular Services vs. Additional Services vs. Reimbursable Expenses",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_6_3 = await ctx.db.insert("topics", {
            subjectId: subj_6,
            name: "Specialized & Allied Architectural Services",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_3,
            name: "Specialized Architectural Services: Scope & Application",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_3,
            name: "Interior Architecture: Scope, Deliverables & Professional Coordination",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_3,
            name: "Allied Professional Services: Coordination with Engineers & Specialists",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_6_4 = await ctx.db.insert("topics", {
            subjectId: subj_6,
            name: "Comprehensive, Design-Build & Post-Construction Services",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_4,
            name: "Comprehensive Architectural Services — SPP Doc 205",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_4,
            name: "Design-Build Services — SPP Doc 206",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_4,
            name: "Post-Construction Services — SPP Doc 207",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_4,
            name: "Property Management: Building Operations & Facility Responsibilities",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_6_5 = await ctx.db.insert("topics", {
            subjectId: subj_6,
            name: "Project Supervision, Competitions & Consulting",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_5,
            name: "Full-Time Construction Supervision — SPP Doc 204-A",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_5,
            name: "Construction Management — SPP Doc 204-B",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_5,
            name: "Full-Time Supervision vs. Construction Management",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_5,
            name: "Architectural Design Competitions — SPP Doc 208",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_6,
            topicId: top_6_5,
            name: "Professional Architectural Consulting Services (PACS) — SPP Doc 209",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_7 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "5_Professional Practice (3)",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_1 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Construction Contract Documents",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_1,
            name: "Standard Owner–Architect Agreements: Essential Terms & Obligations",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_1,
            name: "Owner–Contractor Agreements: Roles, Obligations & Contract Relationships",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_1,
            name: "Subcontracts & Subcontractor Documents",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_1,
            name: "CIAP Document 102: Uniform General Conditions for Construction",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_2 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Specifications & Cost Management",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_2,
            name: "Technical Specifications: Purpose, Structure & Legal Role",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_2,
            name: "CSI MasterFormat: Organizing Construction Specifications",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_2,
            name: "Cost Estimating: Conceptual, Detailed & Bid Estimates",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_2,
            name: "Quantity Surveying & Material Take-Off Fundamentals",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_2,
            name: "Contingency Allocation & Construction Cost Control",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_3 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Project Scheduling & Time Management",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_3,
            name: "Gantt Charts: Activities, Duration & Project Monitoring",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_3,
            name: "Critical Path Method (CPM): Critical Activities & Float",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_3,
            name: "PERT: Time Estimates & Expected Project Duration",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_3,
            name: "CPM vs. PERT vs. Gantt Chart: When to Use Each Tool",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_4 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Bidding & Contract Administration",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Tender Documents & Instructions to Bidders",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Bid Submission, Bid Opening & Contractor Selection",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Progress Billings & Certificates of Payment",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Retention Money: Purpose, Computation & Release",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Change Orders, Variation Orders & Scope Changes",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_4,
            name: "Time Extensions, Delays & Contract Time Adjustments",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_5 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Architectural Firm Management & Office Operations",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_5,
            name: "Sole Proprietorship: Ownership, Control & Professional Practice",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_5,
            name: "Partnership Practice: Rights, Responsibilities & Risks",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_5,
            name: "Corporation & Group Practice: Legal Limits for Architectural Practice",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_5,
            name: "Architectural Office Organization & Project Team Management",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_7_6 = await ctx.db.insert("topics", {
            subjectId: subj_7,
            name: "Risk Management, Bonds & Dispute Resolution",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_6,
            name: "Professional Liability: Negligence, Errors & Omissions",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_6,
            name: "Professional Liability Insurance & Risk Transfer",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_6,
            name: "Performance Bonds, Surety Bonds & Construction Guarantees",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_6,
            name: "Alternative Dispute Resolution: Negotiation & Mediation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_7,
            topicId: top_7_6,
            name: "Construction Industry Arbitration Commission (CIAC)",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_8 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "6_Architectural Design",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_1 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Development Controls & Building Bulk",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_1,
            name: "PD 1096: Core Development Control Terms",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_1,
            name: "TGFA, AMBF, PSO & Building Footprint",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_1,
            name: "Setbacks, TSL & Open Space Requirements",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_1,
            name: "Step-by-Step Maximum TGFA Calculation",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_1,
            name: "Step-by-Step AMBF Calculation",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_2 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Residential Design & Housing Laws",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_2,
            name: "Residential Occupancies under PD 1096",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_2,
            name: "RA 9514: Dwelling Types & Fire Safety",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_2,
            name: "BP 220: Economic & Socialized Housing",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_2,
            name: "PD 957 & RA 9904: Open Market Housing & Subdivisions",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_2,
            name: "Residential Space Planning & Anthropometrics",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_3 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Occupancy, Zoning & Land Use",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_3,
            name: "PD 1096: Occupancy Classification Groups",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_3,
            name: "Residential Zones R-1 to R-5",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_3,
            name: "Commercial, Industrial & Special Land Uses",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_3,
            name: "Matching Occupancy, Zoning & Building Use",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_4 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Site Analysis & Site Planning",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_4,
            name: "Reading Contours, Slopes & Landform",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_4,
            name: "Solar Orientation & Building Placement",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_4,
            name: "Wind, Climate & Natural Ventilation",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_4,
            name: "Drainage, Hydrology & Site Response",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_4,
            name: "Macro vs. Micro Site Analysis",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_5 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Space Programming & Design Process",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_5,
            name: "From Client Brief to Space Program",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_5,
            name: "Adjacency Matrix & Relationship Analysis",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_5,
            name: "Bubble Diagrams & Functional Zoning",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_5,
            name: "Circulation, Efficiency & Net-to-Gross Area",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_5,
            name: "Anthropometrics & Human-Centered Dimensions",
            order: 5,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_6 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Universal Design & Accessibility",
            order: 6,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_6,
            name: "BP 344: Accessible Routes & Ramps",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_6,
            name: "BP 344: Doors, Corridors & Vertical Access",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_6,
            name: "BP 344: Accessible Toilets & Parking",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_6,
            name: "Universal Design Principles in Architectural Planning",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_7 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Fire & Life Safety Planning",
            order: 7,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_7,
            name: "RA 9514: Means of Egress Fundamentals",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_7,
            name: "Occupant Load, Exits & Exit Arrangement",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_7,
            name: "Travel Distance & Exit Access",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_7,
            name: "Firewalls, Fire Zones & Fire-Resistive Design",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_8 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Building Typologies: Commercial & Business",
            order: 8,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_8,
            name: "Retail Planning: Shops, Stores & Malls",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_8,
            name: "Office Planning & Workplace Layouts",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_8,
            name: "Mixed-Use Development Planning",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_8,
            name: "Parking, Service & Back-of-House Planning",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_9 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Building Typologies: Institutional & Assembly",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_9,
            name: "Educational Facilities & Classroom Planning",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_9,
            name: "Healthcare Facilities & Functional Zoning",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_9,
            name: "Assembly Buildings & Crowd Movement",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_9,
            name: "Courts, Atriums & Interior Open Spaces",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_8_10 = await ctx.db.insert("topics", {
            subjectId: subj_8,
            name: "Transportation, Sustainability & Integrated Design",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_10,
            name: "Transportation Facilities & Passenger Flow",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_10,
            name: "Philippine Green Building Code Essentials",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_10,
            name: "Passive Design: Sun, Wind, Water & Vegetation",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_8,
            topicId: top_8_10,
            name: "Integrated ALE Design Problem Solving",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_9 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "7_Theory of Architecture",
            order: 9,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_9_1 = await ctx.db.insert("topics", {
            subjectId: subj_9,
            name: "Primary Elements & Spatial Ordering",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_1,
            name: "Point, Line, Plane, & Volume in Space",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_1,
            name: "Spatial Relationships & Spatial Organizations",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_1,
            name: "Architectural Ordering Principles",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_9_2 = await ctx.db.insert("topics", {
            subjectId: subj_9,
            name: "Human Factors, Ergonomics, & Perception",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_2,
            name: "Anthropometrics vs. Ergonomics",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_2,
            name: "Proxemics & 4 Spatial Zones",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_2,
            name: "Psychology Principles in Architectural Perception",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_9_3 = await ctx.db.insert("topics", {
            subjectId: subj_9,
            name: "Proportion Systems & Theories of Scale",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_3,
            name: "The Golden Section, Classical Orders, & Modulor",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_3,
            name: "Japanese Ken System & Anthropomorphic Proportioning",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_9_4 = await ctx.db.insert("topics", {
            subjectId: subj_9,
            name: "Architectural Philosophies & Master Dictums",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_4,
            name: "Pioneers of Modernism & Their Famous Dictums",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_4,
            name: "Postmodernism, Deconstructivism, & Regionalist Philosophies",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_9,
            topicId: top_9_4,
            name: "National Artists for Architecture (PH) & Design Philosophies",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const subj_10 = await ctx.db.insert("subjects", {
            createdBy: admin._id,
            name: "8_Tropical",
            order: 10,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_10_1 = await ctx.db.insert("topics", {
            subjectId: subj_10,
            name: "Climatic Factors & Tropical Microclimates",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_1,
            name: "Climate Classification",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_1,
            name: "Monsoons and Microclimate Environmental Modifiers",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_1,
            name: "Thermal Comfort Indices, Psychrometric Chart, & Bioclimatic Chart",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_10_2 = await ctx.db.insert("topics", {
            subjectId: subj_10,
            name: "Solar Geometry & Radiation Control",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_2,
            name: "Solar Angles: Altitude, Azimuth, Declination, & Sun Path Diagrams",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_2,
            name: "Design of External Shading Devices: Overhangs, Louvers, & Eggcrates",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_2,
            name: "Horizontal & Vertical Shadow Angles, and SHGC / SC Metrics",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_10_3 = await ctx.db.insert("topics", {
            subjectId: subj_10,
            name: "Passive Cooling Mechanics & Airflow Optimization",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_3,
            name: "Wind-Driven Cross-Ventilation, Inlet/Outlet Ratios, & Venturi Effect",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_3,
            name: "Thermal-Driven Ventilation",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_3,
            name: "Evaporative Cooling, Night-Purge Ventilation, & Thermal Mass in Tropics",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        const top_10_4 = await ctx.db.insert("topics", {
            subjectId: subj_10,
            name: "Philippine Vernacular Architecture & Sustainable Codes",
            order: 4,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_4,
            name: "Bahay Kubo & Bahay na Bato: Passive Design & Thermal Physics",
            order: 1,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_4,
            name: "Site Microclimate Planning: Solar Orientation, Wind Traps, & Vegetation",
            order: 2,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert("lessons", {
            subjectId: subj_10,
            topicId: top_10_4,
            name: "Philippine Green Building Code & BERDE Standards",
            order: 3,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
        });

        return { success: true, subjectsCount: 10 };
    },
});

export const seedDatabase = seedCurriculumFromExcel;

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
