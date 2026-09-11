export type HealthGuidanceTopicId =
  | "check-symptoms"
  | "heart-health"
  | "mental-wellness"
  | "nutrition"
  | "medications"
  | "find-doctor"
  | "emergency";

export interface HealthGuidanceTopic {
  id: HealthGuidanceTopicId;
  title: string;
  response: string;
}

export const healthGuidanceTopics: readonly HealthGuidanceTopic[] = [
  {
    id: "check-symptoms",
    title: "Check Symptoms",
    response: "Note when the symptoms started, how severe they are, and what makes them better or worse. A qualified clinician should assess persistent, worsening, or concerning symptoms.",
  },
  {
    id: "heart-health",
    title: "Heart Health",
    response: "Regular movement, sleep, balanced meals, and appropriate blood-pressure checks support heart health. Seek urgent help for chest pressure, severe breathlessness, fainting, or sudden weakness.",
  },
  {
    id: "mental-wellness",
    title: "Mental Wellness",
    response: "Small routines such as sleep, movement, social contact, and time away from stress can support wellbeing. Contact a qualified professional if distress persists or interferes with daily life.",
  },
  {
    id: "nutrition",
    title: "Nutrition & Diet",
    response: "Prefer sustainable meals with vegetables, protein, fibre, and enough water. A registered dietitian can tailor guidance for allergies, medical conditions, pregnancy, or specific goals.",
  },
  {
    id: "medications",
    title: "Medications",
    response: "Follow the label and your prescriber's instructions. Do not start, stop, or change a prescribed medicine based only on this assistant; ask a pharmacist or clinician when uncertain.",
  },
  {
    id: "find-doctor",
    title: "Find a Doctor",
    response: "Choose a licensed professional whose specialty matches your concern. Check their credentials, availability, consultation format, and whether urgent in-person care is more appropriate.",
  },
  {
    id: "emergency",
    title: "Emergency",
    response: "Call your local emergency service now for severe breathing difficulty, chest pressure, fainting, a seizure, sudden weakness, heavy bleeding, or immediate danger.",
  },
];

export interface HealthAssistantRequest {
  topicId?: HealthGuidanceTopicId;
  question?: string;
}

async function getClientSideHealthAssistantReply(request: HealthAssistantRequest): Promise<string> {
  if (request.topicId) {
    return healthGuidanceTopics.find((topic) => topic.id === request.topicId)?.response ?? "Please choose another topic.";
  }

  const question = request.question?.trim().toLowerCase() ?? "";
  if (/(chest pain|cannot breathe|can't breathe|unconscious|stroke|heavy bleeding)/.test(question)) {
    return "This may require urgent help. Contact your local emergency service now rather than relying on this assistant.";
  }
  if (/(medicine|medication|dose|tablet|inhaler|nebulizer)/.test(question)) {
    return healthGuidanceTopics.find((topic) => topic.id === "medications")!.response;
  }
  if (/(appointment|doctor|consultation)/.test(question)) {
    return healthGuidanceTopics.find((topic) => topic.id === "find-doctor")!.response;
  }
  if (/(diet|food|nutrition|meal)/.test(question)) {
    return healthGuidanceTopics.find((topic) => topic.id === "nutrition")!.response;
  }
  return "I can provide general client-side guidance only. Choose a topic above, or contact a qualified health professional for advice specific to you.";
}

// CLIENT-SIDE MOCK: replace this one binding with a server or AI request function later.
export const requestHealthAssistantReply = getClientSideHealthAssistantReply;
