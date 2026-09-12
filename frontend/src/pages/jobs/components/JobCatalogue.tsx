import { AlertDialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { HealthcareJob } from "../api/requests";

export interface JobCatalogueProps {
  currentAccountId: string;
  deletingJobId: string | null;
  jobs: HealthcareJob[];
  onApply: (job: HealthcareJob) => void;
  onDeleteOwnedJob: (job: HealthcareJob) => void;
}

export function JobCatalogue({ currentAccountId, deletingJobId, jobs, onApply, onDeleteOwnedJob }: JobCatalogueProps) {
  if (jobs.length === 0) {
    return <div className="hj-empty"><strong>No jobs match these filters.</strong><span>Try a broader search.</span></div>;
  }

  return (
    <div className="hj-catalogue">
      {jobs.map((job) => (
        <article className="hj-job-card" key={job.id}>
          <header>
            <div className="hj-company-mark">{job.company.slice(0, 1).toUpperCase()}</div>
            <div><h2>{job.title}</h2><p>{job.company}</p><small>{job.location}</small></div>
            {job.featured ? <span className="hj-featured">Featured</span> : null}
          </header>
          <div className="hj-tags"><span>{job.type}</span><span>{job.specialty}</span>{job.experience ? <span>{job.experience}</span> : null}</div>
          {job.description ? <p className="hj-description">{job.description}</p> : null}
          {job.tags.length > 0 ? <p className="hj-skills">{job.tags.join(" | ")}</p> : null}
          <footer>
            <div><strong>{job.salary || "Salary not listed"}</strong><span>{job.applicants} applications</span></div>
            {job.addedBy && String(job.addedBy) === currentAccountId ? (
              <AlertDialog.Root>
                <AlertDialog.Trigger asChild>
                  <Button className="hj-danger-button" disabled={deletingJobId === job.id} variant="danger">
                    {deletingJobId === job.id ? "Removing..." : "Remove"}
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="hj-dialog-backdrop" />
                  <AlertDialog.Content className="hj-confirm-dialog">
                    <AlertDialog.Title>Remove this job?</AlertDialog.Title>
                    <AlertDialog.Description>{job.title} will no longer appear in the Jobs catalogue.</AlertDialog.Description>
                    <div className="hj-confirm-actions">
                      <AlertDialog.Cancel asChild><Button variant="secondary">Cancel</Button></AlertDialog.Cancel>
                      <AlertDialog.Action asChild><Button variant="danger" onClick={() => onDeleteOwnedJob(job)}>Remove job</Button></AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            ) : null}
            <Button className="hj-primary-button" onClick={() => onApply(job)}>Apply</Button>
          </footer>
        </article>
      ))}
    </div>
  );
}
