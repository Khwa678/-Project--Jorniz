import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import { JobSelect } from "./JobSelect";
import {
  createCandidateCvRecord,
  loadCandidateCvs,
  submitJobApplication,
  type CandidateCv,
  type HealthcareJob,
} from "../api/requests";

export interface JobApplicationFormProps {
  job: HealthcareJob;
  onApplied: (message: string) => void;
}

export function JobApplicationForm({ job, onApplied }: JobApplicationFormProps) {
  const [cvs, setCvs] = useState<CandidateCv[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    void loadCandidateCvs()
      .then((rows) => {
        setCvs(rows);
        setSelectedCvId(rows.find((cv) => Boolean(cv.is_default))?.id || rows[0]?.id || "");
      })
      .catch((error: unknown) => setFailure(error instanceof Error ? error.message : "Could not load saved CVs."))
      .finally(() => setLoadingCvs(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFailure(null);
    try {
      let cvId = selectedCvId;
      if (!cvId) {
        if (!cvTitle.trim() || !cvUrl.trim()) throw new Error("Choose a saved CV or provide a CV title and hosted file URL.");
        cvId = (await createCandidateCvRecord({ title: cvTitle, fileUrl: cvUrl })).cv_id;
      }
      const result = await submitJobApplication({ jobId: job.id, cvId, coverLetter });
      onApplied(result.message || "Application submitted.");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Could not submit the application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="hj-form" onSubmit={(event) => void submit(event)}>
      <header><div><span>Application</span><h2>{job.title}</h2><p>{job.company}</p></div><Dialog.Close asChild><Button size="small" type="button" variant="secondary">Close</Button></Dialog.Close></header>
      {loadingCvs ? <p>Loading saved CVs...</p> : cvs.length > 0 ? (
        <div className="hj-select-field">
          <span>Saved CV</span>
          <JobSelect
            ariaLabel="Saved CV"
            value={selectedCvId}
            onValueChange={setSelectedCvId}
            options={cvs.map((cv) => ({ label: cv.cv_title, value: cv.id }))}
          />
        </div>
      ) : (
        <div className="hj-cv-fields">
          <p>No saved CV record was found. Jorniz currently stores a link; it does not upload CV files.</p>
          <label>CV title<input required value={cvTitle} onChange={(event) => setCvTitle(event.target.value)} /></label>
          <label>Hosted CV URL<input required type="url" value={cvUrl} onChange={(event) => setCvUrl(event.target.value)} /></label>
        </div>
      )}
      <label>Cover letter<textarea rows={6} value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} /></label>
      {failure ? <p className="hj-error" role="alert">{failure}</p> : null}
      <Button className="hj-primary-button" disabled={loadingCvs || submitting} type="submit">{submitting ? "Submitting..." : "Submit application"}</Button>
    </form>
  );
}
