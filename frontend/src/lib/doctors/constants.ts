export const DOCTOR_SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Neurology",
  "Psychiatry",
  "Dentistry",
  "Physiotherapy",
  "Psychology",
  "Nutrition",
  "Other",
] as const;

export type DoctorSpecialty = typeof DOCTOR_SPECIALTIES[number];
