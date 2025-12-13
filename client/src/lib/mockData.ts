// todo: remove mock functionality - replace with real API data

export interface Event {
  id: string;
  name: string;
  location: string;
  time: string;
  tags: string[];
  recommended: boolean;
  swiped: 'left' | 'right' | null;
  date: number;
}

export interface Attendee {
  id: string;
  name: string;
  role: string;
  bio: string;
  tags: string[];
  recommended: boolean;
  swiped: 'left' | 'right' | null;
}

export interface POI {
  name: string;
  type: string;
  desc: string;
}

export interface User {
  name: string;
  role: string;
  tagline: string;
}

export const mockUser: User = {
  name: "A Das",
  role: "Lead AI Architect & Visionary, Synergistic Dynamics",
  tagline: "Pioneering ethical AI frameworks for a hyper-connected future."
};

export const mockEvents: Event[] = [
  { id: 'evt1', name: "Quantum Leap Keynote", location: "Grand Auditorium, L5, Nexus Tower", time: "Dec 15, 09:00", tags: ["Keynote", "Quantum"], recommended: true, swiped: null, date: 15 },
  { id: 'evt2', name: "AI Ethics & Governance Panel", location: "Hall of Wisdom, L3", time: "Dec 15, 14:00", tags: ["AI", "Ethics", "Panel"], recommended: true, swiped: null, date: 15 },
  { id: 'evt3', name: "Executive Networking Mixer", location: "Zenith Lounge, Rooftop", time: "Dec 16, 18:00", tags: ["Networking"], recommended: true, swiped: null, date: 16 },
  { id: 'evt4', name: "Future of Biotech Startup Pitches", location: "Innovation Labs, L2", time: "Dec 17, 11:00", tags: ["Biotech", "Startups", "Investment"], recommended: true, swiped: null, date: 17 },
  { id: 'evt5', name: "Digital Art & AI Exhibition", location: "Cultural Atrium, L1", time: "Dec 16, 10:00-18:00", tags: ["Art", "Social"], recommended: false, swiped: null, date: 16 },
  { id: 'evt6', name: "Intro to Spatial Computing Workshop", location: "Synthesis Pods, L4", time: "Dec 15, 16:00", tags: ["Workshop", "Spatial"], recommended: false, swiped: null, date: 15 },
  { id: 'evt7', name: "The Sentient City: Tech Demo", location: "Data Stream Expo, L1", time: "Dec 17, 15:00", tags: ["Demo", "Smart Cities"], recommended: false, swiped: null, date: 17 },
];

export const mockPOIs: POI[] = [
  { name: "The Quantum Cafe", type: "Refreshment", desc: "Coffee and conversations near the Grand Auditorium." },
  { name: "Zenith Lounge", type: "Networking Hub", desc: "Exclusive rooftop venue for executive mixers." },
  { name: "Synthesis Co-Working Pods", type: "Workspace", desc: "Quiet pods for focused work or small meetings." },
  { name: "Data Stream Expo", type: "Exhibition", desc: "Showcase of the latest in data visualization tech." },
];

export const mockAttendees: Attendee[] = [
  { id: 'att1', name: "Dr. Elara Vance", role: "CSO, Chronos Labs", bio: "Temporal data analysis, predictive modeling.", tags: ["#PredictiveAnalytics", "#DeepTech"], recommended: true, swiped: null },
  { id: 'att2', name: "Julian Thorne", role: "Venture Partner, Aurora Ventures", bio: "Investing in early-stage AI/sustainable energy.", tags: ["#VentureCapital", "#ImpactInvesting"], recommended: true, swiped: null },
  { id: 'att3', name: "Lena Petrova", role: "Lead Data Ethicist, Global AI Council", bio: "Policy for responsible AI.", tags: ["#AIEthics", "#Policy"], recommended: true, swiped: null },
  { id: 'att4', name: "Marcus Chen", role: "CEO, Synapse Robotics", bio: "Autonomous systems for industrial environments.", tags: ["#Robotics", "#Automation"], recommended: true, swiped: null },
  { id: 'att5', name: "Anya Sharma", role: "Product Architect, OmniCorp", bio: "UI for enterprise quantum computing.", tags: ["#QuantumUI", "#ProductStrategy"], recommended: true, swiped: null },
  { id: 'att6', name: "Kenji Tanaka", role: "Founder, NeuroForge", bio: "Brain-computer interface tech.", tags: ["#BCI", "#NeuroTech"], recommended: true, swiped: null },
  { id: 'att7', name: "Isabella Rossi", role: "Head of Innovation, NeoBank Digital", bio: "Digital transformation, blockchain in fintech.", tags: ["#Fintech", "#Blockchain"], recommended: false, swiped: null },
  { id: 'att8', name: "David Lee", role: "Quantum Computing Engineer, Aperture Labs", bio: "Superconducting qubit design.", tags: ["#QuantumHardware", "#Physics"], recommended: true, swiped: null },
];
