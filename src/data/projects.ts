export type Project = {
  title: string;
  tag: string;
  description: string;
  stack: string[];
  caseStudyUrl?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    title: "RDDPDS — Real-Time Dynamic Dark Pattern Detection System",
    tag: "Thesis / Research",
    description:
      "An Android system that detects deceptive mobile ad patterns as they happen — combining a YOLOv11n visual detector, a temporal heuristic engine (H1–H8), and a Contextual Discrepancy Scoring layer.",
    stack: ["YOLOv11n", "AccessibilityService", "Android", "Logistic Regression", "Python"],
    caseStudyUrl: "#",
    repoUrl: "#",
  },
  {
    title: "Senior High Faculty Display Dashboard",
    tag: "Frontend",
    description:
      "An admin dashboard for managing and displaying faculty information — data import flows, editable records, chart-based analytics, and one-click PDF export.",
    stack: ["React", "TypeScript", "shadcn/ui", "Chart.js", "html2canvas"],
    caseStudyUrl: "#",
    repoUrl: "#",
  },
  {
    title: "Your third project goes here",
    tag: "Add one",
    description:
      "Swap this out — DepEd procurement ML pipeline, FSL/MediaPipe recognition, or anything else you want recruiters to see.",
    stack: ["Tag 1", "Tag 2", "Tag 3"],
    caseStudyUrl: "#",
    repoUrl: "#",
  },
];
