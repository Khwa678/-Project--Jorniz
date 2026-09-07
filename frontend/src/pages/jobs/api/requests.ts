import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface HealthcareJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  specialty: string;
  salary?: string;
  experience?: string;
  posted?: string;
  deadline?: string;
  applicants: number;
  tags: string[];
  description?: string;
  featured: boolean;
  addedBy?: string;
}

export interface HealthcareJobDraft {
  title: string;
  company: string;
  location: string;
  jobType: string;
  specialty: string;
  salary: string;
  experience: string;
  deadline: string;
  tags: string[];
  description: string;
  companyLogo?: string;
}

export interface CandidateCv {
  id: string;
  cv_title: string;
  file_url: string;
  is_default?: boolean | number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  title: string;
  company: string;
  location: string;
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
}

function normalizeHealthcareJob(raw: Record<string, unknown>): HealthcareJob {
  return {
    id: String(raw.id || ""),
    title: String(raw.title || "Untitled position"),
    company: String(raw.company || "Unlisted organization"),
    companyLogo: raw.companyLogo ? String(raw.companyLogo) : raw.company_logo ? String(raw.company_logo) : undefined,
    location: String(raw.location || "Remote"),
    type: String(raw.type || raw.job_type || "Full-Time"),
    specialty: String(raw.specialty || "General health"),
    salary: raw.salary ? String(raw.salary) : undefined,
    experience: raw.experience ? String(raw.experience) : undefined,
    posted: raw.posted ? String(raw.posted) : raw.created_at ? String(raw.created_at) : undefined,
    deadline: raw.deadline ? String(raw.deadline) : undefined,
    applicants: Number(raw.applicants || 0),
    tags: parseTags(raw.tags),
    description: raw.description ? String(raw.description) : undefined,
    featured: Boolean(raw.featured),
    addedBy: raw.addedBy ? String(raw.addedBy) : raw.added_by ? String(raw.added_by) : undefined,
  };
}

export async function loadHealthcareJobs(): Promise<HealthcareJob[]> {
  const rows = await requestJornizApi<Record<string, unknown>[]>("/api/jobs");
  return rows.map(normalizeHealthcareJob);
}

export async function postHealthcareJob(draft: HealthcareJobDraft): Promise<HealthcareJob> {
  const result = await requestJornizApi<Record<string, unknown>>("/api/jobs/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: draft.title,
      company: draft.company,
      company_logo: draft.companyLogo || "",
      location: draft.location,
      job_type: draft.jobType,
      specialty: draft.specialty,
      salary: draft.salary,
      experience: draft.experience,
      deadline: draft.deadline,
      tags: draft.tags,
      description: draft.description,
    }),
  });
  return normalizeHealthcareJob(result);
}

export function deleteOwnedHealthcareJob(jobId: string): Promise<{ message: string }> {
  return requestJornizApi<{ message: string }>(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
  });
}

export async function loadCandidateCvs(): Promise<CandidateCv[]> {
  const response = await requestJornizApi<{ cvs: CandidateCv[] }>("/api/jobs/candidate/cvs");
  return response.cvs || [];
}

export function createCandidateCvRecord(input: {
  title: string;
  fileUrl: string;
}): Promise<{ message: string; cv_id: string }> {
  return requestJornizApi<{ message: string; cv_id: string }>("/api/jobs/candidate/cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title, file_url: input.fileUrl }),
  });
}

export function submitJobApplication(input: {
  jobId: string;
  cvId: string;
  coverLetter: string;
}): Promise<{ message: string; application_id: string; status: string; coins_earned?: number; new_hu_coins?: number }> {
  return requestJornizApi(
    `/api/jobs/${encodeURIComponent(input.jobId)}/apply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv_id: input.cvId, cover_letter: input.coverLetter }),
    },
  );
}

export async function loadMyJobApplications(): Promise<JobApplication[]> {
  const response = await requestJornizApi<{ applications: JobApplication[] }>("/api/jobs/applications/mine");
  return response.applications || [];
}
