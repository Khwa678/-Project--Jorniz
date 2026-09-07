import { useEffect, useMemo, useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { JobApplicationForm } from "./components/JobApplicationForm";
import { JobCatalogue } from "./components/JobCatalogue";
import { JobPostingForm } from "./components/JobPostingForm";
import { JobSearchFilters } from "./components/JobSearchFilters";
import { MyJobApplications } from "./components/MyJobApplications";
import {
  deleteOwnedHealthcareJob,
  loadHealthcareJobs,
  loadMyJobApplications,
  type HealthcareJob,
  type JobApplication,
} from "./api/requests";
import "./styles.css";

type JobsTab = "browse" | "applications";

function failureText(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export interface HealthcareJobsPageProps { signedInAccount: SignedInAccount; }

export function HealthcareJobsPage({ signedInAccount }: HealthcareJobsPageProps) {
  const [jobs, setJobs] = useState<HealthcareJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [jobFailure, setJobFailure] = useState<string | null>(null);
  const [applicationFailure, setApplicationFailure] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [jobType, setJobType] = useState("All");
  const [location, setLocation] = useState("All");
  const [tab, setTab] = useState<JobsTab>("browse");
  const [showPostingForm, setShowPostingForm] = useState(false);
  const [applyingTo, setApplyingTo] = useState<HealthcareJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshJobs = async () => {
    setLoadingJobs(true);
    try { setJobs(await loadHealthcareJobs()); setJobFailure(null); }
    catch (error) { setJobs([]); setJobFailure(failureText(error)); }
    finally { setLoadingJobs(false); }
  };
  const refreshApplications = async () => {
    setLoadingApplications(true);
    try { setApplications(await loadMyJobApplications()); setApplicationFailure(null); }
    catch (error) { setApplications([]); setApplicationFailure(failureText(error)); }
    finally { setLoadingApplications(false); }
  };

  useEffect(() => { void refreshJobs(); void refreshApplications(); }, []);

  const types = useMemo(() => Array.from(new Set(jobs.map((job) => job.type))).sort(), [jobs]);
  const locations = useMemo(() => Array.from(new Set(jobs.map((job) => job.location))).sort(), [jobs]);
  const visibleJobs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesText = !query || [job.title, job.company, job.specialty, job.description].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      return matchesText && (jobType === "All" || job.type === jobType) && (location === "All" || job.location === location);
    });
  }, [jobType, jobs, location, searchText]);

  const removeOwnedJob = async (job: HealthcareJob) => {
    if (!window.confirm(`Remove ${job.title}?`)) return;
    setDeletingJobId(job.id);
    try { await deleteOwnedHealthcareJob(job.id); setJobs((current) => current.filter((item) => item.id !== job.id)); }
    catch (error) { setJobFailure(failureText(error)); }
    finally { setDeletingJobId(null); }
  };

  return (
    <section className="hj-page">
      <header className="hj-page-heading">
        <div><span>Healthcare careers</span><h1>Jobs</h1><p>Persisted roles and applications from the Jorniz backend.</p></div>
        <button className="hj-primary-button" type="button" onClick={() => setShowPostingForm(true)}>Post a job</button>
      </header>
      <div className="hj-tabs"><button className={tab === "browse" ? "is-active" : ""} onClick={() => setTab("browse")}>Browse jobs</button><button className={tab === "applications" ? "is-active" : ""} onClick={() => setTab("applications")}>My applications</button></div>
      {notice ? <div className="hj-notice">{notice}</div> : null}
      {tab === "applications" ? <MyJobApplications applications={applications} failure={applicationFailure} loading={loadingApplications} /> : (
        <>
          <JobSearchFilters searchText={searchText} jobType={jobType} location={location} availableTypes={types} availableLocations={locations} onSearchChange={setSearchText} onJobTypeChange={setJobType} onLocationChange={setLocation} />
          {jobFailure ? <div className="hj-error" role="alert"><p>{jobFailure}</p><button onClick={() => void refreshJobs()}>Try again</button></div> : loadingJobs ? <p className="hj-status">Loading healthcare jobs...</p> : jobs.length === 0 ? <div className="hj-empty"><strong>No active jobs are available.</strong><span>New backend job postings will appear here.</span></div> : <JobCatalogue currentAccountId={String(signedInAccount.id)} deletingJobId={deletingJobId} jobs={visibleJobs} onApply={setApplyingTo} onDeleteOwnedJob={(job) => void removeOwnedJob(job)} />}
        </>
      )}
      {showPostingForm ? <div className="hj-dialog-backdrop"><JobPostingForm onCancel={() => setShowPostingForm(false)} onPosted={(job) => { setJobs((current) => [job, ...current]); setShowPostingForm(false); setNotice("Job published successfully."); }} /></div> : null}
      {applyingTo ? <div className="hj-dialog-backdrop"><JobApplicationForm job={applyingTo} onCancel={() => setApplyingTo(null)} onApplied={(message) => { setApplyingTo(null); setNotice(message); setTab("applications"); void refreshApplications(); void refreshJobs(); }} /></div> : null}
    </section>
  );
}
