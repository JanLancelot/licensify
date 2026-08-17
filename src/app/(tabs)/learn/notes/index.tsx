import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Box,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Droplets,
  FileText,
  Hammer,
  Layers,
  Scale,
  Search,
  X,
  Zap,
} from 'lucide-react-native';
import {
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  duration: string;
  summary: string;
  keyPoints: string[];
}

interface Topic {
  id: string;
  topicNumber: number;
  title: string;
  lessons: Lesson[];
}

interface SubjectNote {
  id: string;
  subjectNumber: number;
  title: string;
  area: string;
  weight: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  topics: Topic[];
}

const SUBJECT_NOTES: SubjectNote[] = [
  {
    id: 's1',
    subjectNumber: 1,
    title: 'History & Theory of Architecture',
    area: 'Area 1',
    weight: '30% Weight',
    icon: Building2,
    topics: [
      {
        id: 's1-t1',
        topicNumber: 1,
        title: 'Ancient & Classical Antiquity',
        lessons: [
          {
            id: 's1-t1-l1',
            lessonNumber: 1,
            title: 'Greek Classical Orders (Doric, Ionic, Corinthian)',
            duration: '8 min read',
            summary: 'Proportions, entablature components, column capital characteristics, and optical corrections (entasis) in Greek temple architecture.',
            keyPoints: [
              'Doric Order: Simplest and earliest order. No separate base in Greek Doric; fluted shaft rests directly on stylobate; triglyphs and metopes in frieze.',
              'Ionic Order: Characterized by spiral volutes on capitals, molded base, and continuous decorative frieze.',
              'Corinthian Order: Most ornate classical order, adorned with two rows of acanthus leaves and four corner volutes.',
              'Entasis: Slight convex curving of the column shaft to correct the optical illusion of concavity at a distance.',
            ],
          },
          {
            id: 's1-t1-l2',
            lessonNumber: 2,
            title: 'Roman Monuments, Vaulting & Concrete Systems',
            duration: '10 min read',
            summary: 'Roman structural engineering breakthroughs using pozzolanic concrete (opus caementicium), barrel vaults, cross vaults, and domes.',
            keyPoints: [
              'Opus Caementicium: Roman concrete composed of lime, volcanic pozzolana ash, and aggregate.',
              'Pantheon: Unreinforced concrete dome spanning 43.3m with central open oculus (8.8m diameter) and stepped exterior rings.',
              'Roman Orders: Addition of Tuscan (unfluted simplified Doric) and Composite (Ionic volutes over Corinthian acanthus).',
              'Monumental Types: Colosseum (Amphitheater), Thermae (Baths of Caracalla), Basilica (law courts), and Aqueducts.',
            ],
          },
          {
            id: 's1-t1-l3',
            lessonNumber: 3,
            title: 'Egyptian Temples, Pylons & Hypostyle Halls',
            duration: '7 min read',
            summary: 'Monumental stone architecture of the Old, Middle, and New Kingdoms along the Nile River.',
            keyPoints: [
              'Pylon: Massive trapezoidal entrance gateway with battered (sloping) walls representing the horizon (akhet).',
              'Hypostyle Hall: Forest of columns supporting stone roof slabs with higher central clerestory lighting (e.g. Karnak).',
              'Mastaba: Flat-roofed rectangular tomb structure with sloping sides, precursor to the stepped pyramid of Djoser by Imhotep.',
              'Lotus & Papyrus Capitals: Stylized plant forms symbolizing Upper and Lower Egypt.',
            ],
          },
          {
            id: 's1-t1-l4',
            lessonNumber: 4,
            title: 'Mesopotamian Ziggurats & Early Urban Form',
            duration: '6 min read',
            summary: 'Mud-brick terraced sanctuaries and fortified city complexes of Sumer, Babylon, and Assyria.',
            keyPoints: [
              'Ziggurat: Terraced stepped pyramid tower made of sun-dried mud bricks facing cardinal directions (e.g. Ziggurat of Ur).',
              'Ishtar Gate: Glazed glazed-brick gate of Babylon featuring relief dragons (sirrush) and bulls.',
              'Lamassu: Colossal winged human-headed bull statues guarding Assyrian palace entrances.',
              'Bitumen: Natural asphalt used as waterproofing mortar between clay brick courses.',
            ],
          },
          {
            id: 's1-t1-l5',
            lessonNumber: 5,
            title: 'Aegean & Minoan Palatial Architecture',
            duration: '7 min read',
            summary: 'Pre-Hellenic Aegean civilization architectures in Crete and Mycenae.',
            keyPoints: [
              'Palace of Knossos: Multi-story labyrinthine palace with lightwells, drainage pipes, and inverted downward-tapering wooden columns.',
              'Lion Gate of Mycenae: Post-and-lintel monumental entrance with relieving triangle to distribute lintel weight.',
              'Tholos Tomb (Treasury of Atreus): Beehive-shaped subterranean corbelled stone dome.',
              'Megaron: Central rectangular hearth hall with four columns, prototype for the classical Greek temple.',
            ],
          },
        ],
      },
      {
        id: 's1-t2',
        topicNumber: 2,
        title: 'Medieval, Renaissance & Baroque',
        lessons: [
          {
            id: 's1-t2-l1',
            lessonNumber: 1,
            title: 'Early Christian & Byzantine Basilicas',
            duration: '9 min read',
            summary: 'Transition of Roman basilicas into Christian houses of worship and Byzantine domical mastery.',
            keyPoints: [
              'Hagia Sophia (Isidore of Miletus & Anthemius of Tralles): 31-meter dome supported on spherical triangular pendentives.',
              'Pendentive: Triangular curved masonry segment allowing a circular dome to rest securely over a square base.',
              'Early Christian Plan: Atrium $\\rightarrow$ Narthex $\\rightarrow$ Nave with Aisles $\\rightarrow$ Transept $\\rightarrow$ Apse.',
              'Centralized Plan: Greek cross layout with central dome prevalent in Eastern Orthodox architecture.',
            ],
          },
          {
            id: 's1-t2-l2',
            lessonNumber: 2,
            title: 'High Gothic Cathedrals & Structural Innovations',
            duration: '11 min read',
            summary: 'The quest for height and light through skeletal stone engineering in 12th-14th century Europe.',
            keyPoints: [
              'Three Core Gothic Inventions: Pointed Arches, Ribbed Groin Vaults, and Exterior Flying Buttresses.',
              'Flying Buttress: Masonry arch transmitting lateral roof thrust away from walls to exterior piers, enabling vast stained-glass clerestories.',
              'Abbot Suger: Pioneered Gothic architecture with the rebuilding of the choir at the Basilica of Saint-Denis (1144).',
              'Key Cathedrals: Notre-Dame de Paris, Chartres, Amiens, Reims, and Salisbury Cathedral.',
            ],
          },
          {
            id: 's1-t2-l3',
            lessonNumber: 3,
            title: 'Italian Renaissance Humanism & Brunelleschi',
            duration: '10 min read',
            summary: 'Revival of classical proportions, symmetry, geometry, and humanistic scale in 15th century Florence.',
            keyPoints: [
              'Filippo Brunelleschi: Florence Cathedral dome (Santa Maria del Fiore) built without wooden centering using herringbone brickwork.',
              'Leon Battista Alberti: Author of "De Re Aedificatoria" (Ten Books on Architecture); designed Palazzo Rucellai and Sant\'Andrea.',
              'Andrea Palladio: Master of symmetry and villas; author of "I Quattro Libri dell\'Architettura" (Four Books of Architecture).',
              'High Renaissance: Donato Bramante (Tempietto) and Michelangelo (St. Peter\'s Basilica Dome).',
            ],
          },
        ],
      },
      {
        id: 's1-t3',
        topicNumber: 3,
        title: 'Philippine Vernacular & Colonial Architecture',
        lessons: [
          {
            id: 's1-t3-l1',
            lessonNumber: 1,
            title: 'Traditional Bahay Kubo & Regional Dwellings',
            duration: '8 min read',
            summary: 'Indigenous climatic adaptations, materials, and spatial components of Filipino vernacular dwellings.',
            keyPoints: [
              'Bahay Kubo Structure: Raised on stilts (tukod) for flood protection and natural ventilation; bamboo (kawayan) and nipa/cogon roof.',
              'Bulwagan: Main multi-purpose living and sleeping area.',
              'Batalan: Unroofed rear platform for washing, water jars (tapayan), and sanitation.',
              'Regional Variations: Ivatan Sinadumparan (stone-lime walls in Batanes), Torogan (Maranao royal house with panolong flaring beam ends), Ifugao Bale.',
            ],
          },
          {
            id: 's1-t3-l2',
            lessonNumber: 2,
            title: 'Bahay na Bato & Earthquake Baroque Churches',
            duration: '9 min read',
            summary: 'Hispanic-Filipino hybrid colonial residential and ecclesiastical stone-and-timber architecture.',
            keyPoints: [
              'Bahay na Bato Concept: "Arquitectura Mestiza" — ground floor stone masonry (silong/zaguan) with flexible upper timber living quarters.',
              'Key Components: Ventanilla (sliding louvers under windows), Volada (overhanging cantilever balcony), Calado (fretwork clerestory transoms).',
              'UNESCO Baroque Churches: Paoay (buttresses), Miagao (bas-relief facade), San Agustin Manila, Santa Maria.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    subjectNumber: 2,
    title: 'Architectural Design & Space Planning',
    area: 'Area 3',
    weight: '40% Weight',
    icon: Compass,
    topics: [
      {
        id: 's2-t1',
        topicNumber: 1,
        title: 'Space Programming & Functional Matrices',
        lessons: [
          {
            id: 's2-t1-l1',
            lessonNumber: 1,
            title: 'Adjacency Matrices & Bubble Diagramming',
            duration: '7 min read',
            summary: 'Methods for spatial relationship modeling, privacy zoning, and traffic flow optimization.',
            keyPoints: [
              'Adjacency Matrix: Tabular chart scoring the interaction level between spaces (Direct, Indirect, Undesirable).',
              'Zoning Hierarchy: Public $\\rightarrow$ Semi-Public $\\rightarrow$ Private $\\rightarrow$ Service Zones.',
              'Circulation Allowance: Standard residential corridor width (min 1.0m); primary commercial egress (min 1.2m to 2.0m).',
            ],
          },
          {
            id: 's2-t1-l2',
            lessonNumber: 2,
            title: 'Anthropometrics & Ergonomic Clearances',
            duration: '8 min read',
            summary: 'Human dimensional data applied to architectural clear dimensions, countertop heights, and reach zones.',
            keyPoints: [
              'Kitchen Counter Height: Standard 0.85m to 0.90m height with 0.60m depth.',
              'Dining Clearance: Minimum 0.90m from table edge to wall for chair movement and service pass.',
              'Stair Ergonomics (Blondel Formula): $2R + T = 600\\text{ to }650\\text{ mm}$ (Riser max 200mm, Tread min 250mm).',
            ],
          },
        ],
      },
      {
        id: 's2-t2',
        topicNumber: 2,
        title: 'Site Analysis & Climate-Responsive Design',
        lessons: [
          {
            id: 's2-t2-l1',
            lessonNumber: 1,
            title: 'Sun Path & Wind Orientation (Amihan / Habagat)',
            duration: '9 min read',
            summary: 'Passive solar orientation, prevailing monsoons, and natural ventilation in tropical architecture.',
            keyPoints: [
              'Amihan (Northeast Monsoon): Cool, dry winds prevailing from October to February.',
              'Habagat (Southwest Monsoon): Warm, humid rain-bearing winds from June to September.',
              'Solar Orientation: Place longer building axis East-West to minimize heat gain on North-South facades.',
              'Stack Effect & Cross-Ventilation: Low air inlets on windward side with high warm-air exhaust outlets on leeward side.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's3',
    subjectNumber: 3,
    title: 'Building Technology & Materials',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Hammer,
    topics: [
      {
        id: 's3-t1',
        topicNumber: 1,
        title: 'Concrete Mix Ratios & Curing Standards',
        lessons: [
          {
            id: 's3-t1-l1',
            lessonNumber: 1,
            title: 'Concrete Mix Classes (AA, A, B, C) & Applications',
            duration: '8 min read',
            summary: 'Proportioning cement, sand, and gravel for specified compressive strengths.',
            keyPoints: [
              'Class AA (1:1.5:3): 4,000 psi compressive strength; underwater and high-strength retaining walls.',
              'Class A (1:2:4): 3,000 psi; reinforced columns, beams, girders, and suspended slabs.',
              'Class B (1:2.5:5): 2,500 psi; non-load bearing walls, lintels, and ground floor slabs.',
              'Class C (1:3:6): 2,000 psi; plant boxes, mass plain concrete, and footing beds.',
              'Curing Duration: Standard 28-day hydration period for full design strength.',
            ],
          },
          {
            id: 's3-t1-l2',
            lessonNumber: 2,
            title: 'Slump Testing & Quality Control',
            duration: '6 min read',
            summary: 'ASTM standard slump cone test procedures for measuring workability and consistency of fresh concrete.',
            keyPoints: [
              'Slump Cone Dimensions: 300mm height, 200mm base diameter, 100mm top diameter.',
              'Standard Slumps: Slabs and beams (75mm - 125mm); Footings and heavy mass concrete (50mm - 100mm).',
            ],
          },
        ],
      },
      {
        id: 's3-t2',
        topicNumber: 2,
        title: 'Masonry, Metals & Moisture Protection',
        lessons: [
          {
            id: 's3-t2-l1',
            lessonNumber: 1,
            title: 'Concrete Hollow Blocks (CHB) & Rebar Spacing',
            duration: '7 min read',
            summary: 'Standard Philippine masonry specifications, mortar fills, and reinforcing rebar layouts.',
            keyPoints: [
              'Standard CHB Sizes: 100mm (4") for interior non-load bearing; 150mm (6") for exterior perimeter walls.',
              'Rebar Reinforcement: Typically 10mm or 12mm bars spaced at 600mm horizontal and 600mm vertical.',
              'Mortar Mix: 1:3 cement-to-sand ratio for structural block jointing.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's4',
    subjectNumber: 4,
    title: 'Structural Conceptualization & Design',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Box,
    topics: [
      {
        id: 's4-t1',
        topicNumber: 1,
        title: 'Lateral Load Resisting Systems',
        lessons: [
          {
            id: 's4-t1-l1',
            lessonNumber: 1,
            title: 'Shear Walls, Moment Frames & Braced Cores',
            duration: '9 min read',
            summary: 'Seismic and wind force distribution mechanisms across multi-story structural configurations.',
            keyPoints: [
              'Shear Wall: Reinforced concrete wall designed to resist in-plane lateral shear and overturning moments.',
              'Special Moment Resisting Frame (SMRF): Ductile beam-column joints providing energy dissipation during seismic excitation.',
              'Center of Mass (CM) vs Center of Rigidity (CR): Minimizing eccentricity prevents catastrophic torsional twisting during earthquakes.',
            ],
          },
        ],
      },
      {
        id: 's4-t2',
        topicNumber: 2,
        title: 'Foundation Systems & Soil Mechanics',
        lessons: [
          {
            id: 's4-t2-l1',
            lessonNumber: 1,
            title: 'Shallow vs Deep Foundation Selection',
            duration: '8 min read',
            summary: 'Isolated footings, combined footings, mat foundations, and driven/bored pile systems.',
            keyPoints: [
              'Isolated Spread Footing: Most economical foundation for stable soils with adequate bearing capacity.',
              'Mat (Raft) Foundation: Thick slab supporting all building columns where soil bearing is low or differential settlement is a risk.',
              'Pile Foundations: End-bearing and friction piles transferring heavy superstructure loads to hard bedrock.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's5',
    subjectNumber: 5,
    title: 'Utilities: Plumbing & Sanitary Systems',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Droplets,
    topics: [
      {
        id: 's5-t1',
        topicNumber: 1,
        title: 'National Plumbing Code & Drainage Layouts',
        lessons: [
          {
            id: 's5-t1-l1',
            lessonNumber: 1,
            title: 'Trap Seals, Vents & Drainage Slopes',
            duration: '8 min read',
            summary: 'Plumbing code mandates for preventing sewer gas leakage, backpressure, and siphonage.',
            keyPoints: [
              'Trap Seal Depth: Minimum of 51mm (2 inches) to maximum of 102mm (4 inches).',
              'Horizontal Drainage Slope: Minimum 2% slope (1/4 inch per foot) for pipes $\\le$ 3 inches.',
              'Vent Stack Termination: Minimum 15cm (6 inches) above the roof line.',
            ],
          },
        ],
      },
      {
        id: 's5-t2',
        topicNumber: 2,
        title: 'Septic Tank Design & Water Supply',
        lessons: [
          {
            id: 's5-t2-l1',
            lessonNumber: 1,
            title: 'Septic Tank Compartments & Retention Times',
            duration: '8 min read',
            summary: 'Digestion and leaching chamber capacities, baffling, and wastewater flow rates.',
            keyPoints: [
              'Minimum Liquid Depth: 0.60 meters (2 feet); maximum depth usually 1.80 meters.',
              'Digestion Chamber: Must comprise at least 2/3 of the total septic tank volume.',
              'Leaching Chamber: Remaining 1/3 volume for liquid effluent filtration.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's6',
    subjectNumber: 6,
    title: 'Utilities: Electrical, HVAC & Acoustics',
    area: 'Area 2',
    weight: '30% Weight',
    icon: Zap,
    topics: [
      {
        id: 's6-t1',
        topicNumber: 1,
        title: 'Philippine Electrical Code & Illumination',
        lessons: [
          {
            id: 's6-t1-l1',
            lessonNumber: 1,
            title: 'Branch Circuits, Panelboards & Wire Sizing',
            duration: '8 min read',
            summary: 'Wire gauges (AWG/mm²), ampere ratings, circuit protection, and illumination levels.',
            keyPoints: [
              'General Lighting Circuit: 15A or 20A breaker with 2.0 mm² (#14 AWG) or 3.5 mm² (#12 AWG) copper wire.',
              'Convenience Outlets: Maximum 8 to 10 duplex outlets per 20A branch circuit.',
              'Lux Requirements: Office desk work (300-500 lux); drafting/fine detail (750-1000 lux).',
            ],
          },
        ],
      },
      {
        id: 's6-t2',
        topicNumber: 2,
        title: 'HVAC Air Conditioning & Room Acoustics',
        lessons: [
          {
            id: 's6-t2-l1',
            lessonNumber: 1,
            title: 'HVAC System Types & Sound Absorption (NRC/STC)',
            duration: '9 min read',
            summary: 'Split vs VRF systems, cooling load estimates (CFM), and acoustic isolation.',
            keyPoints: [
              'VRF (Variable Refrigerant Flow): High energy efficiency for buildings with varied zone cooling needs.',
              'STC (Sound Transmission Class): Rating of airborne sound attenuation through partition assemblies.',
              'NRC (Noise Reduction Coefficient): Measure of sound energy absorbed by interior surfaces (0 to 1).',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's7',
    subjectNumber: 7,
    title: 'Professional Practice & Ethics (RA 9266)',
    area: 'Area 3',
    weight: '40% Weight',
    icon: Scale,
    topics: [
      {
        id: 's7-t1',
        topicNumber: 1,
        title: 'The Architecture Act of 2004 (RA 9266)',
        lessons: [
          {
            id: 's7-t1-l1',
            lessonNumber: 1,
            title: 'Mandatory Signing & Sealing of Architectural Plans',
            duration: '10 min read',
            summary: 'Statutory provisions governing exclusive licensure, registration, and criminal liabilities for illegal practice.',
            keyPoints: [
              'Section 20: Exclusively Registered and Licensed Architects (RLAs) may sign and seal architectural documents.',
              'PRBoA: Professional Regulatory Board of Architecture under the PRC.',
              'IAPOA: Integrated and Accredited Professional Organization of Architects (UAP).',
              'Penal Provisions: Fines from ₱100,000 to ₱5,000,000 and imprisonment for illegal practice.',
            ],
          },
        ],
      },
      {
        id: 's7-t2',
        topicNumber: 2,
        title: 'Standards of Professional Practice (SPP Docs)',
        lessons: [
          {
            id: 's7-t2-l1',
            lessonNumber: 1,
            title: 'SPP 201 (Pre-Design) & SPP 202 (Regular Design)',
            duration: '9 min read',
            summary: 'Scope of architectural deliverables, phases, and schedule of professional compensation.',
            keyPoints: [
              'SPP 201: Pre-design services including feasibility studies, site selection, and space programming.',
              'SPP 202 Phases: Schematic Design $\\rightarrow$ Design Development $\\rightarrow$ Contract Documents $\\rightarrow$ Construction Phase.',
              'Architects Credo: Fiduciary duties of integrity, public safety, and ethical conduct.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's8',
    subjectNumber: 8,
    title: 'Building Laws & Codes (NBCP PD 1096)',
    area: 'Area 3',
    weight: '40% Weight',
    icon: FileText,
    topics: [
      {
        id: 's8-t1',
        topicNumber: 1,
        title: 'National Building Code (PD 1096)',
        lessons: [
          {
            id: 's8-t1-l1',
            lessonNumber: 1,
            title: 'Rule 7 & 8: AMBF, TOSL, GFA & TGFA Calculations',
            duration: '12 min read',
            summary: 'Zoning calculations, open space ratios, setbacks, and allowable maximum building footprint computations.',
            keyPoints: [
              'AMBF (Allowable Maximum Building Footprint): Total Lot Area (TLA) minus Total Open Space on Lot (TOSL).',
              'TOSL: Impervious Surface Area (ISA) + Unpaved Surface Area (USA).',
              'GFA vs TGFA: TGFA includes non-GFA covered areas such as parking, balconies, and open roof decks.',
              'Group A Occupancy: Residential single-family dwellings and duplexes.',
            ],
          },
        ],
      },
      {
        id: 's8-t2',
        topicNumber: 2,
        title: 'Fire Code of the Philippines (RA 9514)',
        lessons: [
          {
            id: 's8-t2-l1',
            lessonNumber: 1,
            title: 'Means of Egress, Travel Distance & Fire Ratings',
            duration: '10 min read',
            summary: 'Exit door widths, corridor ratings, stair enclosures, and automatic sprinkler trigger thresholds.',
            keyPoints: [
              'Minimum Exit Width: 915mm (36 inches) clear width for standard egress doors.',
              'Travel Distance to Exit: Max 46 meters without sprinkler system; Max 61 meters with sprinkler system.',
              'Panic Hardware: Required on egress doors serving occupant loads $\\ge$ 50 persons.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 's9',
    subjectNumber: 9,
    title: 'Urban Planning & Housing (BP 220 & PD 957)',
    area: 'Area 1',
    weight: '30% Weight',
    icon: Layers,
    topics: [
      {
        id: 's9-t1',
        topicNumber: 1,
        title: 'Socialized & Economic Housing Standards',
        lessons: [
          {
            id: 's9-t1-l1',
            lessonNumber: 1,
            title: 'BP 220 Minimum Lot Sizes & Frontages',
            duration: '10 min read',
            summary: 'Batas Pambansa 220 parameters for low-cost socialized and economic housing projects.',
            keyPoints: [
              'BP 220 Socialized Single Detached: Minimum 64 sq.m lot size (Economic: 72 sq.m).',
              'BP 220 Duplex / Semi-Detached: Minimum 48 sq.m lot size (Economic: 54 sq.m).',
              'BP 220 Rowhouse: Minimum 28 sq.m lot size (Economic: 36 sq.m) with max 20 units per block.',
            ],
          },
        ],
      },
      {
        id: 's9-t2',
        topicNumber: 2,
        title: 'Subdivision Law (PD 957) & Urban Zoning',
        lessons: [
          {
            id: 's9-t2-l1',
            lessonNumber: 1,
            title: 'PD 957 Open Space Allocations & Road ROWs',
            duration: '9 min read',
            summary: 'Presidential Decree 957 open space, community facility, and right-of-way hierarchies for commercial subdivisions.',
            keyPoints: [
              'PD 957 Open Market Single Detached: Minimum 120 sq.m lot size (Medium cost: 100 sq.m).',
              'Major Collector Road ROW: Minimum 10.0m to 12.0m width.',
              'Parks & Playgrounds: Mandatory percentage allocation (3.5% to 9.0%) based on gross project density.',
            ],
          },
        ],
      },
    ],
  },
];

export default function NotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  // Track which subjects are expanded (Level 1) - all closed initially
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  // Track which topics are expanded (Level 2) - all closed initially
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  // Modal for reading lesson notes
  const [selectedLesson, setSelectedLesson] = useState<{
    subjectTitle: string;
    topicTitle: string;
    lesson: Lesson;
  } | null>(null);

  const toggleSubject = (subjectId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const toggleTopic = (topicId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const filteredSubjects = SUBJECT_NOTES.map((subject) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return subject;

    const matchesSubject = subject.title.toLowerCase().includes(q);

    const filteredTopics = subject.topics.map((topic) => {
      const matchesTopic = topic.title.toLowerCase().includes(q);
      const filteredLessons = topic.lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q)
      );

      if (matchesTopic || filteredLessons.length > 0) {
        return {
          ...topic,
          lessons: filteredLessons.length > 0 ? filteredLessons : topic.lessons,
        };
      }
      return null;
    }).filter(Boolean) as Topic[];

    if (matchesSubject || filteredTopics.length > 0) {
      return {
        ...subject,
        topics: filteredTopics.length > 0 ? filteredTopics : subject.topics,
      };
    }
    return null;
  }).filter(Boolean) as SubjectNote[];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.topBarTitles}>
          <Text style={[styles.topBarKicker, { color: theme.accent }]}>
            CURRICULUM SYLLABUS
          </Text>
          <Text style={[styles.topBarHeading, { color: theme.text }]}>
            Comprehensive Notes
          </Text>
        </View>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search subjects, topics, lessons or laws..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Subject List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 60 },
        ]}>
        <View style={styles.listContainer}>
          {filteredSubjects.map((subject) => {
            const isSubjectOpen = !!expandedSubjects[subject.id] || searchQuery.length > 0;
            const IconComponent = subject.icon;
            const totalLessons = subject.topics.reduce(
              (acc, t) => acc + t.lessons.length,
              0
            );

            return (
              <View
                key={subject.id}
                style={[
                  styles.subjectCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                {/* LEVEL 1: SUBJECT HEADER (BUTTON) */}
                <Pressable
                  onPress={() => toggleSubject(subject.id)}
                  style={({ pressed }) => [
                    styles.subjectHeader,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}>
                  {/* Left Circular Logo (matching learn page style) */}
                  <View
                    style={[
                      styles.circleLogo,
                      {
                        backgroundColor: theme.accentMuted,
                      },
                    ]}>
                    <IconComponent size={24} color={theme.accent} strokeWidth={2.2} />
                  </View>

                  {/* Subject Title & Topics/Lessons Count */}
                  <View style={styles.subjectHeaderInfo}>
                    <Text style={[styles.subjectTitle, { color: theme.text }]}>
                      {subject.title}
                    </Text>
                    <Text style={[styles.subjectSubtext, { color: theme.textSecondary }]}>
                      {subject.topics.length} Topics • {totalLessons} Lessons
                    </Text>
                  </View>

                  {/* Borderless Dropdown Chevron */}
                  <View style={styles.chevronWrapper}>
                    {isSubjectOpen ? (
                      <ChevronDown size={18} color={theme.accent} strokeWidth={2.2} />
                    ) : (
                      <ChevronRight size={18} color={theme.accent} strokeWidth={2.2} />
                    )}
                  </View>
                </Pressable>

                {/* LEVEL 2: TOPICS DROPDOWN */}
                {isSubjectOpen && (
                  <View
                    style={[
                      styles.topicsWrapper,
                      {
                        borderTopColor: theme.border,
                        backgroundColor: theme.backgroundSelected,
                      },
                    ]}>
                    {subject.topics.map((topic) => {
                      const isTopicOpen = !!expandedTopics[topic.id] || searchQuery.length > 0;

                      return (
                        <View
                          key={topic.id}
                          style={[
                            styles.topicCard,
                            {
                              backgroundColor: theme.backgroundElement,
                              borderColor: theme.border,
                            },
                          ]}>
                          {/* TOPIC HEADER ROW */}
                          <Pressable
                            onPress={() => toggleTopic(topic.id)}
                            style={({ pressed }) => [
                              styles.topicHeader,
                              { opacity: pressed ? 0.75 : 1 },
                            ]}>
                            <View style={styles.topicHeaderLeft}>
                              <View
                                style={[
                                  styles.topicNumberBadge,
                                  {
                                    backgroundColor: theme.accentMuted,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.topicNumberText,
                                    { color: theme.accent },
                                  ]}>
                                  T{topic.topicNumber}
                                </Text>
                              </View>
                              <View style={styles.topicTitleBox}>
                                <Text
                                  style={[styles.topicTitle, { color: theme.text }]}>
                                  {topic.title}
                                </Text>
                                <Text
                                  style={[
                                    styles.topicLessonCount,
                                    { color: theme.textSecondary },
                                  ]}>
                                  {topic.lessons.length} Lessons Available
                                </Text>
                              </View>
                            </View>

                            <View style={styles.topicChevron}>
                              {isTopicOpen ? (
                                <ChevronDown size={16} color={theme.accent} strokeWidth={2} />
                              ) : (
                                <ChevronRight size={16} color={theme.accent} strokeWidth={2} />
                              )}
                            </View>
                          </Pressable>

                          {/* LEVEL 3: LESSONS DROPDOWN */}
                          {isTopicOpen && (
                            <View
                              style={[
                                styles.lessonsContainer,
                                { borderTopColor: theme.border },
                              ]}>
                              {topic.lessons.map((lesson, lIdx) => (
                                <Pressable
                                  key={lesson.id}
                                  onPress={() =>
                                    setSelectedLesson({
                                      subjectTitle: subject.title,
                                      topicTitle: topic.title,
                                      lesson,
                                    })
                                  }
                                  style={({ pressed }) => [
                                    styles.lessonRow,
                                    {
                                      borderBottomColor:
                                        lIdx < topic.lessons.length - 1
                                          ? theme.border
                                          : 'transparent',
                                      opacity: pressed ? 0.65 : 1,
                                    },
                                  ]}>
                                  <View style={styles.lessonRowLeft}>
                                    <View
                                      style={[
                                        styles.lessonNumCircle,
                                        {
                                          backgroundColor: theme.accentMuted,
                                        },
                                      ]}>
                                      <Text
                                        style={[
                                          styles.lessonNumText,
                                          { color: theme.accent },
                                        ]}>
                                        {lesson.lessonNumber}
                                      </Text>
                                    </View>
                                    <View style={styles.lessonTitleBox}>
                                      <Text
                                        style={[
                                          styles.lessonTitle,
                                          { color: theme.text },
                                        ]}>
                                        {lesson.title}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.lessonDuration,
                                          { color: theme.textSecondary },
                                        ]}>
                                        {lesson.duration}
                                      </Text>
                                    </View>
                                  </View>

                                  <ChevronRight size={15} color={theme.accent} strokeWidth={2} />
                                </Pressable>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* LESSON READING MODAL */}
      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLesson(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}>
          <View style={[styles.modalTopBar, { borderBottomColor: theme.border }]}>
            <View style={styles.modalTitleBox}>
              <Text style={[styles.modalAreaTag, { color: theme.accent }]}>
                {selectedLesson?.subjectTitle} • {selectedLesson?.topicTitle}
              </Text>
              <Text style={[styles.modalMainTitle, { color: theme.text }]}>
                {selectedLesson?.lesson.title}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedLesson(null)}
              hitSlop={12}
              style={({ pressed }) => [
                styles.modalCloseBtn,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}>
              <X size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}>
            {/* Overview Card */}
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
                CORE SUMMARY & CONCEPTS
              </Text>
              <Text style={[styles.modalSummaryText, { color: theme.text }]}>
                {selectedLesson?.lesson.summary}
              </Text>
            </View>

            {/* Key Points */}
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.modalCardLabel, { color: theme.accent }]}>
                KEY EXAM PROVISIONS & SPECIFICATIONS
              </Text>

              <View style={styles.keyPointsList}>
                {selectedLesson?.lesson.keyPoints.map((point, index) => (
                  <View key={index} style={styles.pointRow}>
                    <View
                      style={[
                        styles.pointBullet,
                        { backgroundColor: theme.accent },
                      ]}
                    />
                    <Text style={[styles.pointText, { color: theme.text }]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Practice CTA */}
            <Pressable
              onPress={() => {
                setSelectedLesson(null);
                router.push('/(tabs)/practice' as any);
              }}
              style={[
                styles.modalPracticeBtn,
                { backgroundColor: theme.accent },
              ]}>
              <Text style={styles.modalPracticeText}>
                Practice Questions on this Subject
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitles: {
    flex: 1,
  },
  topBarKicker: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  topBarHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* Search */
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },

  /* List */
  listContainer: {
    gap: 12,
  },

  /* LEVEL 1: Subject Card */
  subjectCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  circleLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  subjectTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subjectSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevronWrapper: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* LEVEL 2: Topics Wrapper */
  topicsWrapper: {
    borderTopWidth: 1,
    padding: 10,
    gap: 8,
  },
  topicCard: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  topicNumberBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  topicNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  topicTitleBox: {
    flex: 1,
    gap: 2,
  },
  topicTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  topicLessonCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  topicChevron: {
    paddingLeft: 8,
  },

  /* LEVEL 3: Lessons Container */
  lessonsContainer: {
    borderTopWidth: 1,
    paddingLeft: 12,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  lessonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  lessonTitleBox: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  lessonDuration: {
    fontSize: 11,
  },

  /* Modal */
  modalContainer: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalTitleBox: {
    flex: 1,
    gap: 2,
  },
  modalAreaTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  modalCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  modalCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalSummaryText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  keyPointsList: {
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalPracticeBtn: {
    paddingVertical: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalPracticeText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
