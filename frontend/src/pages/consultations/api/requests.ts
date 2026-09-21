import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface DoctorProfile {
  id: string;
  user_id?: string;
  name: string;
  specialty: string;
  qualification?: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  reviews_count: number;
  hospital?: string;
  location?: string;
  avatar_url?: string;
  bio?: string;
  available_days: string[];
  verification_status?: string;
  is_verified?: boolean;
}

export interface AvailableDoctorSlot {
  id: string;
  doctor_id: string;
  slot_time: string;
  price: number;
}

export interface AppointmentBookingResult {
  message: string;
  appointment_id: string;
  room_token: string;
}

export interface ConsultationRoom {
  appointment_id: string;
  room_token: string;
  turn_credentials?: string;
  status: string;
}

function parseAvailableDays(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    return value.split(",").map((day) => day.trim()).filter(Boolean);
  }
}

function normalizeDoctor(raw: Record<string, unknown>): DoctorProfile {
  return {
    id: String(raw.id || ""),
    user_id: raw.user_id ? String(raw.user_id) : undefined,
    name: String(raw.name || "Unnamed doctor"),
    specialty: String(raw.specialty || "General medicine"),
    qualification: raw.qualification ? String(raw.qualification) : undefined,
    experience_years: Number(raw.experience_years ?? raw.experience ?? 0),
    consultation_fee: Number(raw.consultation_fee ?? raw.fee ?? raw.price ?? 0),
    rating: Number(raw.rating ?? 0),
    reviews_count: Number(raw.reviews_count ?? raw.reviews ?? 0),
    hospital: raw.hospital ? String(raw.hospital) : undefined,
    location: raw.location ? String(raw.location) : undefined,
    avatar_url: raw.avatar_url ? String(raw.avatar_url) : undefined,
    bio: raw.bio ? String(raw.bio) : undefined,
    available_days: parseAvailableDays(raw.available_days),
    verification_status: raw.verification_status ? String(raw.verification_status) : undefined,
    is_verified: Boolean(raw.is_verified),
  };
}

export async function loadApprovedDoctors(): Promise<DoctorProfile[]> {
  const response = await requestJornizApi<Record<string, unknown>[] | { doctors: Record<string, unknown>[] }>("/api/doctors");
  const rows = Array.isArray(response) ? response : response.doctors || [];
  return rows.map(normalizeDoctor);
}

export function bookAvailableDoctorSlot(input: {
  doctorId: string;
  slotId: string;
  slotTime: string;
}): Promise<AppointmentBookingResult> {
  return requestJornizApi<AppointmentBookingResult>("/api/doctors/book-atomic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctor_id: input.doctorId,
      slot_id: input.slotId,
      slot_time: input.slotTime,
    }),
  });
}

export async function loadConsultationRoom(appointmentId: string): Promise<ConsultationRoom> {
  const response = await requestJornizApi<{ room: ConsultationRoom }>(
    `/api/consultations/${encodeURIComponent(appointmentId)}/room`,
  );
  return response.room;
}
