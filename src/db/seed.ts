import { db } from './client';
import * as schema from './schema';
import * as crypto from 'expo-crypto';

async function computeHash(questionId: string, choiceId: string) {
  const payload = `${questionId}:${choiceId}`;
  return await crypto.digestStringAsync(
    crypto.CryptoDigestAlgorithm.SHA256,
    payload
  );
}

export async function seedSampleData() {
  console.log('[Seed] Seeding comprehensive sample data for ALL subjects, topics, flashcards, materials, and quizzes...');

  // 1. Clear existing sample data to avoid duplicates
  await db.delete(schema.quizAnswers);
  await db.delete(schema.quizAttempts);
  await db.delete(schema.quizzes);
  await db.delete(schema.questions);
  await db.delete(schema.flashcards);
  await db.delete(schema.materials);
  await db.delete(schema.topics);
  await db.delete(schema.subjects);
  await db.delete(schema.users);

  // 2. User Profile
  await db.insert(schema.users).values({
    id: 'local-student-1',
    userId: 'student-auth-001',
    username: 'arch_student',
    firstName: 'Adrian',
    lastName: 'Candidate',
    role: 'student',
    isActive: true,
  });

  // 3. Subjects
  const sub1 = 'sub-arch-design';
  const sub2 = 'sub-building-utils';
  const sub3 = 'sub-structural-concept';

  await db.insert(schema.subjects).values([
    {
      id: sub1,
      name: 'Architectural Design & Site Planning',
      description: 'Master anthropometrics, spatial programming, zoning regulations, master planning, and design concepts.',
      isPublished: true,
      order: 1,
    },
    {
      id: sub2,
      name: 'Building Utilities & Sanitation',
      description: 'Plumbing, sanitary drainage, electrical circuits, illumination, HVAC, acoustics, and fire safety systems.',
      isPublished: true,
      order: 2,
    },
    {
      id: sub3,
      name: 'Structural Conceptualization',
      description: 'Structural systems, timber, steel, reinforced concrete, seismic design, soil mechanics, and foundations.',
      isPublished: true,
      order: 3,
    },
  ]);

  // 4. Topics
  const top1_1 = 'top-space-planning';
  const top1_2 = 'top-zoning-codes';
  const top2_1 = 'top-plumbing-systems';
  const top2_2 = 'top-electrical-lighting';
  const top3_1 = 'top-concrete-steel';
  const top3_2 = 'top-foundations';

  await db.insert(schema.topics).values([
    // Subject 1 Topics
    {
      id: top1_1,
      subjectId: sub1,
      name: 'Space Planning & Ergonomics',
      description: 'Functional layout optimization, circulation corridors, anthropometrics, and accessibility compliance.',
      order: 1,
      isPublished: true,
    },
    {
      id: top1_2,
      subjectId: sub1,
      name: 'Building Codes & Zoning Regulations',
      description: 'Building envelope setbacks, Floor Area Ratio (FAR), maximum building footprint, and fire life-safety egress.',
      order: 2,
      isPublished: true,
    },
    // Subject 2 Topics
    {
      id: top2_1,
      subjectId: sub2,
      name: 'Plumbing & Sanitary Drainage',
      description: 'Water distribution networks, sanitary stacks, trap seal preservation, fixture unit calculations, and venting.',
      order: 1,
      isPublished: true,
    },
    {
      id: top2_2,
      subjectId: sub2,
      name: 'Electrical Systems & Illumination',
      description: 'Branch circuit design, load computations, transformer sizing, lux levels, and architectural lighting layouts.',
      order: 2,
      isPublished: true,
    },
    // Subject 3 Topics
    {
      id: top3_1,
      subjectId: sub3,
      name: 'Reinforced Concrete & Steel Framing',
      description: 'Beam/column load paths, moment-resisting frames, shear walls, rebar placement, and steel connection details.',
      order: 1,
      isPublished: true,
    },
    {
      id: top3_2,
      subjectId: sub3,
      name: 'Soil Mechanics & Foundations',
      description: 'Shallow isolated footings, mat foundations, deep piles, soil bearing capacity (SBC), and retaining walls.',
      order: 2,
      isPublished: true,
    },
  ]);

  // 5. Materials
  await db.insert(schema.materials).values([
    // Sub 1 - Top 1
    {
      id: 'mat-1-1-1',
      subjectId: sub1,
      topicId: top1_1,
      title: 'Architectural Clearances & Anthropometric Data',
      description: 'Crucial dimensions for doorways, corridors, turning radius, and standard counter elevations.',
      type: 'article',
      content: 'Standard kitchen countertop height: 850mm-900mm. Minimum corridor clearance for commercial egress: 1200mm (single exit) / 1800mm (two-way high traffic). Minimum turning diameter for wheelchair accessibility: 1500mm.',
    },
    {
      id: 'mat-1-1-2',
      subjectId: sub1,
      topicId: top1_1,
      title: 'Kitchen Work Triangle & Spatial Ergonomics',
      description: 'Guidelines for the relationship between the sink, refrigerator, and cooking range.',
      type: 'document',
      content: 'The total perimeter of the work triangle should measure between 4.0m and 7.9m. No major circulation path should cross through the triangle.',
    },
    // Sub 1 - Top 2
    {
      id: 'mat-1-2-1',
      subjectId: sub1,
      topicId: top1_2,
      title: 'National Building Code: Setbacks & FAR Formulas',
      description: 'Reference tables for Front, Side, and Rear yard setbacks based on zoning classifications.',
      type: 'document',
      content: 'FAR (Floor Area Ratio) = Gross Floor Area / Total Lot Area. Maximum allowable building footprint depends on Total Open Space within Lot (TOSL) requirements.',
    },
    // Sub 2 - Top 1
    {
      id: 'mat-2-1-1',
      subjectId: sub2,
      topicId: top2_1,
      title: 'Sanitary Drainage & Venting Systems Handbook',
      description: 'Understanding drainage fixture units (DFU), minimum pipe slopes, and siphonage prevention.',
      type: 'article',
      content: 'Horizontal sanitary piping (75mm and smaller) requires a minimum 2% slope (20mm per meter / 1/4 in per ft). Trap seal depth must be between 50mm and 100mm.',
    },
    // Sub 2 - Top 2
    {
      id: 'mat-2-2-1',
      subjectId: sub2,
      topicId: top2_2,
      title: 'Recommended Illumination Standards (Lux Levels)',
      description: 'Standard lighting levels for drafting offices, conference rooms, corridors, and residential spaces.',
      type: 'article',
      content: 'General drafting & detailed architectural design: 750-1000 Lux. Office desk general work: 400-500 Lux. Hallways and stairwells: 100-150 Lux.',
    },
    // Sub 3 - Top 1
    {
      id: 'mat-3-1-1',
      subjectId: sub3,
      topicId: top3_1,
      title: 'Concrete Cover & Rebar Placement Standards',
      description: 'Minimum concrete cover requirements for slabs, beams, columns, and foundations exposed to weather.',
      type: 'document',
      content: 'Concrete cast directly against earth: 75mm minimum cover. Beams & columns not exposed to weather: 40mm cover. Slabs: 20mm minimum cover.',
    },
    // Sub 3 - Top 2
    {
      id: 'mat-3-2-1',
      subjectId: sub3,
      topicId: top3_2,
      title: 'Foundation Selection: Shallow vs. Deep Systems',
      description: 'Comparative guide for isolated footings, combined footings, mat foundations, and driven piles.',
      type: 'article',
      content: 'Use isolated spread footings for competent soil (SBC > 150 kPa). Use mat / raft foundations when footing area exceeds 50% of the building footprint. Use deep pile foundations for soft clay or deep compressible layers.',
    },
  ]);

  // 6. Flashcards
  await db.insert(schema.flashcards).values([
    // Sub 1 - Top 1
    {
      id: 'fc-1',
      subjectId: sub1,
      topicId: top1_1,
      front: 'What is the standard recommended kitchen counter height?',
      back: '850mm to 900mm (34 to 36 inches).',
    },
    {
      id: 'fc-2',
      subjectId: sub1,
      topicId: top1_1,
      front: 'What is the minimum diameter required for a wheelchair turning circle?',
      back: '1,500 mm (60 inches / 5 feet).',
    },
    // Sub 1 - Top 2
    {
      id: 'fc-3',
      subjectId: sub1,
      topicId: top1_2,
      front: 'What does FAR stand for in zoning and urban planning?',
      back: 'Floor Area Ratio = (Total Gross Floor Area / Total Lot Area).',
    },
    {
      id: 'fc-4',
      subjectId: sub1,
      topicId: top1_2,
      front: 'What is the minimum clear doorway width for accessible egress?',
      back: '800 mm clear opening (typically requiring a 900mm door leaf).',
    },
    // Sub 2 - Top 1
    {
      id: 'fc-5',
      subjectId: sub2,
      topicId: top2_1,
      front: 'What is the primary function of a plumbing vent pipe?',
      back: 'To equalize air pressure in the drainage system and protect trap seals from siphonage.',
    },
    {
      id: 'fc-6',
      subjectId: sub2,
      topicId: top2_1,
      front: 'What is the minimum required slope for a 50mm sanitary horizontal drain pipe?',
      back: '2% slope (20 mm per meter or 1/4 inch per foot).',
    },
    // Sub 2 - Top 2
    {
      id: 'fc-7',
      subjectId: sub2,
      topicId: top2_2,
      front: 'What is the standard unit of measurement for luminous flux?',
      back: 'Lumen (lm). Illuminance is measured in Lux (lm/m²).',
    },
    // Sub 3 - Top 1
    {
      id: 'fc-8',
      subjectId: sub3,
      topicId: top3_1,
      front: 'What is the primary purpose of stirrups / ties in a reinforced concrete beam?',
      back: 'To resist diagonal tension (shear stresses) and hold longitudinal rebar in position.',
    },
    // Sub 3 - Top 2
    {
      id: 'fc-9',
      subjectId: sub3,
      topicId: top3_2,
      front: 'What is the minimum concrete protective cover for footings cast against earth?',
      back: '75 mm (3 inches).',
    },
  ]);

  // 7. Questions
  const q1 = 'q-ergonomics-1';
  const q2 = 'q-ergonomics-2';
  const q3 = 'q-zoning-1';
  const q4 = 'q-zoning-2';
  const q5 = 'q-plumbing-1';
  const q6 = 'q-plumbing-2';
  const q7 = 'q-electrical-1';
  const q8 = 'q-concrete-1';
  const q9 = 'q-foundation-1';

  // Hashes
  const q1Choices = [
    { id: 'c1', text: '1,000 mm' },
    { id: 'c2', text: '1,200 mm' },
    { id: 'c3', text: '1,500 mm' },
    { id: 'c4', text: '1,800 mm' },
  ];
  const q1Hash = await computeHash(q1, 'c3'); // 1,500mm

  const q2Choices = [
    { id: 'c1', text: '750 mm' },
    { id: 'c2', text: '900 mm' },
    { id: 'c3', text: '1,050 mm' },
    { id: 'c4', text: '1,200 mm' },
  ];
  const q2Hash = await computeHash(q2, 'c2'); // 900mm

  const q3Choices = [
    { id: 'c1', text: 'Total Gross Floor Area ÷ Total Lot Area' },
    { id: 'c2', text: 'Building Footprint ÷ Yard Setbacks' },
    { id: 'c3', text: 'Building Height ÷ Lot Frontage' },
    { id: 'c4', text: 'Usable Floor Area ÷ Open Space' },
  ];
  const q3Hash = await computeHash(q3, 'c1'); // GFA / TLA

  const q4Choices = [
    { id: 'c1', text: '600 mm' },
    { id: 'c2', text: '700 mm' },
    { id: 'c3', text: '800 mm' },
    { id: 'c4', text: '1,000 mm' },
  ];
  const q4Hash = await computeHash(q4, 'c3'); // 800mm

  const q5Choices = [
    { id: 'c1', text: '0.5% (1/16 in/ft)' },
    { id: 'c2', text: '1.0% (1/8 in/ft)' },
    { id: 'c3', text: '2.0% (1/4 in/ft)' },
    { id: 'c4', text: '5.0% (5/8 in/ft)' },
  ];
  const q5Hash = await computeHash(q5, 'c3'); // 2%

  const q6Choices = [
    { id: 'c1', text: 'Trap seal siphonage from backpressure or aspiration' },
    { id: 'c2', text: 'Water hammer vibration' },
    { id: 'c3', text: 'Corrosion of copper pipes' },
    { id: 'c4', text: 'Overfilling of septic tanks' },
  ];
  const q6Hash = await computeHash(q6, 'c1'); // Trap seal siphonage

  const q7Choices = [
    { id: 'c1', text: '50 - 100 Lux' },
    { id: 'c2', text: '150 - 200 Lux' },
    { id: 'c3', text: '400 - 500 Lux' },
    { id: 'c4', text: '750 - 1,000 Lux' },
  ];
  const q7Hash = await computeHash(q7, 'c4'); // 750-1000 Lux

  const q8Choices = [
    { id: 'c1', text: 'Tensile and shear stresses' },
    { id: 'c2', text: 'Pure compressive loads only' },
    { id: 'c3', text: 'Thermal radiation' },
    { id: 'c4', text: 'Water penetration' },
  ];
  const q8Hash = await computeHash(q8, 'c1'); // Tensile and shear

  const q9Choices = [
    { id: 'c1', text: '25 mm' },
    { id: 'c2', text: '40 mm' },
    { id: 'c3', text: '50 mm' },
    { id: 'c4', text: '75 mm' },
  ];
  const q9Hash = await computeHash(q9, 'c4'); // 75 mm

  await db.insert(schema.questions).values([
    {
      id: q1,
      subjectId: sub1,
      topicId: top1_1,
      question: 'What is the standard minimum wheelchair turning clearance diameter for accessible spatial design?',
      choices: JSON.stringify(q1Choices),
      correctChoiceHash: q1Hash,
      explanation: 'Accessibility guidelines mandate a minimum 1.50m (1500mm) turning clear circle for 360-degree wheelchair rotation.',
      difficulty: 'medium',
    },
    {
      id: q2,
      subjectId: sub1,
      topicId: top1_1,
      question: 'What is the standard ergonomic countertop working height for residential kitchens?',
      choices: JSON.stringify(q2Choices),
      correctChoiceHash: q2Hash,
      explanation: 'Standard kitchen base cabinets with countertops are designed at 850mm to 900mm (34-36 inches) above finished floor level.',
      difficulty: 'easy',
    },
    {
      id: q3,
      subjectId: sub1,
      topicId: top1_2,
      question: 'How is the Floor Area Ratio (FAR) calculated?',
      choices: JSON.stringify(q3Choices),
      correctChoiceHash: q3Hash,
      explanation: 'FAR is defined as the ratio between the total gross floor area (GFA) of a building and the total area of the lot (TLA).',
      difficulty: 'easy',
    },
    {
      id: q4,
      subjectId: sub1,
      topicId: top1_2,
      question: 'What is the minimum clear opening width required for accessible exit doorways?',
      choices: JSON.stringify(q4Choices),
      correctChoiceHash: q4Hash,
      explanation: 'Accessibility and building codes mandate a minimum clear door opening width of 800mm.',
      difficulty: 'medium',
    },
    {
      id: q5,
      subjectId: sub2,
      topicId: top2_1,
      question: 'What is the standard minimum pitch required for horizontal sanitary drainage pipes 75mm (3") and smaller?',
      choices: JSON.stringify(q5Choices),
      correctChoiceHash: q5Hash,
      explanation: 'Sanitary pipes 75mm and smaller must maintain a minimum 2% slope (1/4" per foot) for self-cleansing scouring velocity.',
      difficulty: 'medium',
    },
    {
      id: q6,
      subjectId: sub2,
      topicId: top2_1,
      question: 'What hazardous phenomenon do plumbing ventilation stacks specifically prevent?',
      choices: JSON.stringify(q6Choices),
      correctChoiceHash: q6Hash,
      explanation: 'Vent pipes equalize atmospheric pressure in drain lines, preventing trap seal siphonage that would allow sewer gases to enter.',
      difficulty: 'medium',
    },
    {
      id: q7,
      subjectId: sub2,
      topicId: top2_2,
      question: 'What is the recommended design illuminance level for detailed architectural drafting and technical studios?',
      choices: JSON.stringify(q7Choices),
      correctChoiceHash: q7Hash,
      explanation: 'High-precision drafting and technical drawing tasks require 750 to 1,000 Lux of illuminance.',
      difficulty: 'hard',
    },
    {
      id: q8,
      subjectId: sub3,
      topicId: top3_1,
      question: 'Why is steel reinforcement embedded in reinforced concrete structural members?',
      choices: JSON.stringify(q8Choices),
      correctChoiceHash: q8Hash,
      explanation: 'Concrete has high compressive strength but weak tensile/shear capacity; steel rebar resists tensile and diagonal shear forces.',
      difficulty: 'easy',
    },
    {
      id: q9,
      subjectId: sub3,
      topicId: top3_2,
      question: 'What is the minimum required concrete cover thickness for foundations cast permanently against earth?',
      choices: JSON.stringify(q9Choices),
      correctChoiceHash: q9Hash,
      explanation: 'Footings and foundation elements poured directly against undisturbed soil require a minimum 75mm (3 in) protective cover.',
      difficulty: 'medium',
    },
  ]);

  // 8. Quizzes
  await db.insert(schema.quizzes).values([
    // Subject 1 - Comprehensive Mock Exam (Subject-level)
    {
      id: 'quiz-sub1-mock-exam',
      title: '🏆 Architectural Design Comprehensive Mock Exam',
      description: 'Full simulation exam covering anthropometrics, space planning, and zoning code formulas.',
      type: 'mock_exam',
      subjectId: sub1,
      topicId: undefined, // Subject-level
      questionIds: JSON.stringify([q1, q2, q3, q4]),
      timeLimitSeconds: 600,
      passingScore: 75,
    },
    // Sub 1 - Topic 1 Quiz
    {
      id: 'quiz-top1-1-practice',
      title: 'Space Planning & Ergonomics Quick Assessment',
      description: 'Practice quiz on dimensional clearances and accessible design standards.',
      type: 'practice',
      subjectId: sub1,
      topicId: top1_1,
      questionIds: JSON.stringify([q1, q2]),
      timeLimitSeconds: 300,
      passingScore: 70,
    },
    // Sub 1 - Topic 2 Quiz
    {
      id: 'quiz-top1-2-practice',
      title: 'Zoning & Building Code Practice Quiz',
      description: 'Test your calculation skills on FAR, setbacks, and door egress rules.',
      type: 'practice',
      subjectId: sub1,
      topicId: top1_2,
      questionIds: JSON.stringify([q3, q4]),
      timeLimitSeconds: 300,
      passingScore: 70,
    },
    // Subject 2 - Comprehensive Mock Exam (Subject-level)
    {
      id: 'quiz-sub2-mock-exam',
      title: '🏆 Building Utilities & Systems Board Exam Prep',
      description: 'Comprehensive test covering plumbing traps, pipe sizing, lighting levels, and electrical principles.',
      type: 'mock_exam',
      subjectId: sub2,
      topicId: undefined, // Subject-level
      questionIds: JSON.stringify([q5, q6, q7]),
      timeLimitSeconds: 480,
      passingScore: 75,
    },
    // Sub 2 - Topic 1 Quiz
    {
      id: 'quiz-top2-1-practice',
      title: 'Plumbing & Sanitation Systems Quiz',
      description: 'Test your understanding of trap seals, venting mechanisms, and pipe slopes.',
      type: 'practice',
      subjectId: sub2,
      topicId: top2_1,
      questionIds: JSON.stringify([q5, q6]),
      timeLimitSeconds: 300,
      passingScore: 70,
    },
    // Sub 2 - Topic 2 Quiz
    {
      id: 'quiz-top2-2-practice',
      title: 'Illumination & Electrical Systems Quiz',
      description: 'Test your knowledge on lighting lux levels and electrical circuits.',
      type: 'practice',
      subjectId: sub2,
      topicId: top2_2,
      questionIds: JSON.stringify([q7]),
      timeLimitSeconds: 180,
      passingScore: 70,
    },
    // Subject 3 - Comprehensive Mock Exam (Subject-level)
    {
      id: 'quiz-sub3-mock-exam',
      title: '🏆 Structural Conceptualization & Design Exam',
      description: 'Complete mock assessment covering concrete rebar, foundation mechanics, and footing depths.',
      type: 'mock_exam',
      subjectId: sub3,
      topicId: undefined, // Subject-level
      questionIds: JSON.stringify([q8, q9]),
      timeLimitSeconds: 300,
      passingScore: 75,
    },
    // Sub 3 - Topic 1 Quiz
    {
      id: 'quiz-top3-1-practice',
      title: 'Reinforced Concrete & Steel Systems Quiz',
      description: 'Practice quiz on rebar placement and concrete tension mechanics.',
      type: 'practice',
      subjectId: sub3,
      topicId: top3_1,
      questionIds: JSON.stringify([q8]),
      timeLimitSeconds: 180,
      passingScore: 70,
    },
    // Sub 3 - Topic 2 Quiz
    {
      id: 'quiz-top3-2-practice',
      title: 'Foundations & Soil Mechanics Quiz',
      description: 'Assess your understanding of concrete cover standards and footing types.',
      type: 'practice',
      subjectId: sub3,
      topicId: top3_2,
      questionIds: JSON.stringify([q9]),
      timeLimitSeconds: 180,
      passingScore: 70,
    },
  ]);

  console.log('[Seed] Comprehensive sample data seeding completed successfully!');
  return { success: true };
}
