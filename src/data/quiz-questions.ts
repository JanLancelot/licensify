import { QuizQuestion } from '@/types/curriculum';

export const QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    area: 'area-3',
    areaLabel: 'Area 3: Design & Laws',
    difficulty: 'medium',
    question:
      'Under the National Building Code of the Philippines (PD 1096), what is the formula to determine the Allowable Maximum Building Footprint (AMBF)?',
    options: [
      'AMBF = TLA - TOSL',
      'AMBF = TLA x FLAR',
      'AMBF = ISA + USA',
      'AMBF = TLA - GFA',
    ],
    correctIndex: 0,
    explanation:
      'The Allowable Maximum Building Footprint (AMBF) is calculated by subtracting the Total Open Space within Lot (TOSL) from the Total Lot Area (TLA). TOSL itself consists of ISA (Impervious Surface Area) and USA (Unpaved Surface Area).',
    reference: 'PD 1096 (NBCP) Rule 7 & 8 Guidelines',
  },
  {
    id: 'q2',
    area: 'area-1',
    areaLabel: 'Area 1: History & Planning',
    difficulty: 'easy',
    question:
      'Which Greek architectural order features a capital composed of two rows of acanthus leaves topped by small volutes?',
    options: ['Doric Order', 'Ionic Order', 'Corinthian Order', 'Tuscan Order'],
    correctIndex: 2,
    explanation:
      'The Corinthian order is the most ornate of the classical Greek orders, characterized by inverted bell-shaped capitals adorned with sculpted acanthus leaves and miniature volutes at the corners.',
    reference: 'History of Architecture — Classical Antiquity',
  },
  {
    id: 'q3',
    area: 'area-2',
    areaLabel: 'Area 2: Structural & Utilities',
    difficulty: 'medium',
    question:
      'What is the standard minimum depth of water trap seal required for sanitary plumbing fixtures to prevent sewer gas entry?',
    options: ['1 inch (25 mm)', '2 inches (51 mm)', '6 inches (152 mm)', '8 inches (203 mm)'],
    correctIndex: 1,
    explanation:
      'Under the Revised National Plumbing Code of the Philippines, standard plumbing fixture traps must have a liquid trap seal of not less than 2 inches (51 mm) and not more than 4 inches (102 mm).',
    reference: 'Revised National Plumbing Code (Sec. 1002)',
  },
  {
    id: 'q4',
    area: 'area-3',
    areaLabel: 'Area 3: Design & Laws',
    difficulty: 'easy',
    question:
      'Under Republic Act No. 9266 (The Architecture Act of 2004), who is legally mandated to sign and dry-seal architectural plans and documents?',
    options: [
      'Any Civil Engineer with building experience',
      'Registered and Licensed Architect (RLA)',
      'Master Plumber or Environmental Planner',
      'Draftsman certified by TESDA',
    ],
    correctIndex: 1,
    explanation:
      'Section 20 of RA 9266 explicitly restricts the signing and dry-sealing of all architectural drawings, specifications, and related contract documents exclusively to Registered and Licensed Architects (RLAs).',
    reference: 'RA 9266 — Architecture Act of 2004, Sec. 20',
  },
  {
    id: 'q5',
    area: 'area-2',
    areaLabel: 'Area 2: Structural & Utilities',
    difficulty: 'hard',
    question:
      'What is the volumetric proportion for Class A concrete mix and its expected compressive strength at 28 days?',
    options: [
      '1 : 1.5 : 3 (4,000 psi)',
      '1 : 2 : 4 (3,000 psi)',
      '1 : 2.5 : 5 (2,500 psi)',
      '1 : 3 : 6 (2,000 psi)',
    ],
    correctIndex: 1,
    explanation:
      'Class A concrete mix consists of 1 part cement, 2 parts sand, and 4 parts gravel (1:2:4), commonly developing 3,000 psi compressive strength after 28 days of standard hydration and curing.',
    reference: 'National Structural Code of the Philippines (NSCP)',
  },
  {
    id: 'q6',
    area: 'area-1',
    areaLabel: 'Area 1: History & Planning',
    difficulty: 'medium',
    question:
      'Under BP 220 (Socialized Housing Standards), what is the minimum lot size for a single-detached residential dwelling?',
    options: ['48 sq.m', '54 sq.m', '64 sq.m', '72 sq.m'],
    correctIndex: 2,
    explanation:
      'Under Batas Pambansa Blg. 220, the minimum lot size for single-detached socialized housing is 64 sq.m (whereas economic housing requires 72 sq.m).',
    reference: 'BP 220 Economic and Socialized Housing Standards',
  },
];
