export type HealthGuidanceTopicId =
  | "urgent-warning-signs"
  | "everyday-wellbeing"
  | "medication-safety"
  | "appointment-preparation";

export interface HealthGuidanceTopic {
  id: HealthGuidanceTopicId;
  title: string;
  summary: string;
  guidance: readonly string[];
}

export const healthGuidanceTopics: readonly HealthGuidanceTopic[] = [
  {
    id: "urgent-warning-signs",
    title: "Urgent warning signs",
    summary: "Know when general website guidance is not appropriate.",
    guidance: [
      "Call local emergency services for severe breathing difficulty, chest pressure, unconsciousness, stroke signs, uncontrolled bleeding, or a rapidly worsening emergency.",
      "Do not wait for this prototype or an online reply when immediate help may be needed.",
    ],
  },
  {
    id: "everyday-wellbeing",
    title: "Everyday wellbeing",
    summary: "Simple, non-diagnostic health habits.",
    guidance: [
      "Use regular sleep, hydration, movement, and balanced meals as general wellbeing foundations.",
      "Discuss persistent, worsening, or function-limiting symptoms with a qualified clinician.",
    ],
  },
  {
    id: "medication-safety",
    title: "Medication safety",
    summary: "General precautions before using a medicine.",
    guidance: [
      "Follow the prescription label and the instructions supplied with the medicine or device.",
      "Ask a pharmacist or clinician before changing a dose, combining medicines, or using an unfamiliar delivery method.",
    ],
  },
  {
    id: "appointment-preparation",
    title: "Prepare for an appointment",
    summary: "Organise useful information for a clinician.",
    guidance: [
      "Write down symptoms, when they started, what changes them, and any medicines or supplements you use.",
      "Bring relevant reports and prepare the questions you most want answered.",
    ],
  },
];

export function findHealthGuidance(topicId: HealthGuidanceTopicId): HealthGuidanceTopic {
  return healthGuidanceTopics.find((topic) => topic.id === topicId) ?? healthGuidanceTopics[0];
}

export function answerScriptedHealthQuestion(question: string): string {
  const normalized = question.toLowerCase();
  if (/(chest pain|cannot breathe|can't breathe|unconscious|stroke|heavy bleeding)/.test(normalized)) {
    return "This may require urgent help. Contact local emergency services now rather than relying on this prototype.";
  }
  if (/(medicine|medication|dose|tablet|inhaler|nebulizer)/.test(normalized)) {
    return "This prototype cannot verify a personal dose or treatment. Follow the prescription and ask a pharmacist or clinician before changing how the medicine is used.";
  }
  if (/(appointment|doctor|consultation)/.test(normalized)) {
    return "Prepare when the symptoms started, what changes them, your medicines, relevant reports, and your most important questions.";
  }
  return "This is scripted prototype guidance, not an AI or clinical response. Choose a guided topic or contact a qualified clinician for personal advice.";
}
