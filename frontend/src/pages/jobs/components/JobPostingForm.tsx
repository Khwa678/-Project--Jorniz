import { useState } from "react";
import { postHealthcareJob, type HealthcareJob, type HealthcareJobDraft } from "../api/requests";

export interface JobPostingFormProps {
  onCancel: () => void;
  onPosted: (job: HealthcareJob) => void;
}

const emptyDraft: HealthcareJobDraft = {
  title: "", company: "", location: "", jobType: "Full-Time", specialty: "",
  salary: "", experience: "", deadline: "", tags: [], description: "", companyLogo: "",
};

export function JobPostingForm({ onCancel, onPosted }: JobPostingFormProps) {
  const [draft, setDraft] = useState(emptyDraft);
  const [tagText, setTagText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const update = (field: keyof HealthcareJobDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.company.trim() || !draft.description.trim()) {
      setFailure("Job title, organization and description are required.");
      return;
    }
    setSubmitting(true);
    setFailure(null);
    try {
      const job = await postHealthcareJob({
        ...draft,
        tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      onPosted(job);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Could not post the job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="hj-form" onSubmit={(event) => void submit(event)}>
      <header><div><span>Recruiting</span><h2>Post a healthcare job</h2></div><button type="button" onClick={onCancel}>Close</button></header>
      <div className="hj-form-grid">
        <label>Job title<input required value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label>Organization<input required value={draft.company} onChange={(event) => update("company", event.target.value)} /></label>
        <label>Location<input value={draft.location} onChange={(event) => update("location", event.target.value)} placeholder="Remote" /></label>
        <label>Job type<select value={draft.jobType} onChange={(event) => update("jobType", event.target.value)}><option>Full-Time</option><option>Part-Time</option><option>Internship</option><option>Residency</option></select></label>
        <label>Specialty<input value={draft.specialty} onChange={(event) => update("specialty", event.target.value)} /></label>
        <label>Experience<input value={draft.experience} onChange={(event) => update("experience", event.target.value)} /></label>
        <label>Salary<input value={draft.salary} onChange={(event) => update("salary", event.target.value)} /></label>
        <label>Deadline<input type="date" value={draft.deadline} onChange={(event) => update("deadline", event.target.value)} /></label>
        <label className="hj-wide">Company logo URL<input type="url" value={draft.companyLogo} onChange={(event) => update("companyLogo", event.target.value)} /></label>
        <label className="hj-wide">Skills, comma separated<input value={tagText} onChange={(event) => setTagText(event.target.value)} /></label>
        <label className="hj-wide">Description<textarea required rows={5} value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
      </div>
      {failure ? <p className="hj-error" role="alert">{failure}</p> : null}
      <button className="hj-primary-button" disabled={submitting} type="submit">{submitting ? "Posting..." : "Publish job"}</button>
    </form>
  );
}
