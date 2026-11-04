export type Project = {
  title: string;
  tag: string;
  description: string;
  stack: string[];
  caseStudyUrl?: string;
  repoUrl?: string;
  // Shown instead of a repo link when the code isn't public yet.
  repoNote?: string;
};

export const projects: Project[] = [
  {
    title: "RDDPDS — Real-Time Dynamic Dark Pattern Detection System",
    tag: "Thesis / Research - Ongoing",
    description:
      "An Android system that detects deceptive mobile ad patterns as they happen — combining a YOLOv11n visual detector, a temporal heuristic engine (H1–H8), and a Contextual Discrepancy Scoring layer.",
    stack: [
      "Java",
      "Android",
      "AccessibilityService",
      "YOLOv11n",
      "TensorFlow Lite",
      "Python",
    ],
    repoUrl: "https://github.com/PigZahHot/DarkPattern-Detector",
  },
  {
    title: "CAL-E — RAG Chatbot for the City of Calamba",
    tag: "Final Project",
    description:
      "A retrieval-augmented generation (RAG) chatbot that answers questions about the City of Calamba, with a Flask backend and a lightweight static web frontend.",
    stack: ["Python", "Flask", "RAG", "JavaScript", "HTML/CSS"],
    repoUrl: "https://github.com/justhMae/CAL-E_RAG-chatbot",
  },
  {
    title: "Senior High Faculty Display Dashboard",
    tag: "Frontend",
    description:
      "A faculty status display board and admin dashboard — faculty update their status through a Microsoft Teams chatbot, while admins manage records, filter data, view chart-based analytics, and export to CSV/PDF.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Chart.js"],
    repoUrl:
      "https://github.com/appdev-faculty-status-display/Senior-High-Faculty-Display-Dashboard",
  },
  {
    title: "Dormitory Management & Visitor Tracking System",
    tag: "Full-stack · Team project",
    description:
      "A full-stack system for tenant, room, billing, and visitor management, with session-based authentication and role-based access for four roles (Admin, Staff, Security, Tenant) on a 9-table MySQL schema.",
    stack: ["PHP", "MySQL", "PDO", "JavaScript"],
    repoNote: "Repo coming soon",
  },
];
