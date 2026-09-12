import { useEffect, useMemo, useState } from "react";
import { Dialog, Tabs } from "radix-ui";
import { Button } from "../../components/ui/Button";
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
    setDeletingJobId(job.id);
    try { await deleteOwnedHealthcareJob(job.id); setJobs((current) => current.filter((item) => item.id !== job.id)); }
    catch (error) { setJobFailure(failureText(error)); }
    finally { setDeletingJobId(null); }
  };

  return (
    <section className="hj-page">
      <header className="hj-page-heading workspace-page-heading">
        <div><h1>Jobs</h1><p className="workspace-page-tagline">Discover healthcare roles and manage your applications.</p></div>
        <Button className="hj-primary-button" onClick={() => setShowPostingForm(true)}>Post a job</Button>
      </header>
      <Tabs.Root className="hj-tabs-root" value={tab} onValueChange={(value) => setTab(value as JobsTab)}>
        <Tabs.List className="hj-tabs" aria-label="Jobs sections">
          <Tabs.Trigger value="browse">Browse jobs</Tabs.Trigger>
          <Tabs.Trigger value="applications">My applications</Tabs.Trigger>
        </Tabs.List>
        {notice ? <div className="hj-notice">{notice}</div> : null}
        <Tabs.Content className="hj-tab-content" value="applications">
          <MyJobApplications applications={applications} failure={applicationFailure} loading={loadingApplications} />
        </Tabs.Content>
        <Tabs.Content className="hj-tab-content" value="browse">
          <JobSearchFilters searchText={searchText} jobType={jobType} location={location} availableTypes={types} availableLocations={locations} onSearchChange={setSearchText} onJobTypeChange={setJobType} onLocationChange={setLocation} />
          {jobFailure ? <div className="hj-error" role="alert"><p>{jobFailure}</p><Button variant="secondary" onClick={() => void refreshJobs()}>Try again</Button></div> : loadingJobs ? <p className="hj-status">Loading healthcare jobs...</p> : jobs.length === 0 ? <div className="hj-empty"><strong>No active jobs are available.</strong><span>New backend job postings will appear here.</span></div> : <JobCatalogue currentAccountId={String(signedInAccount.id)} deletingJobId={deletingJobId} jobs={visibleJobs} onApply={setApplyingTo} onDeleteOwnedJob={(job) => void removeOwnedJob(job)} />}
        </Tabs.Content>
      </Tabs.Root>
      <Dialog.Root open={showPostingForm} onOpenChange={setShowPostingForm}>
        <Dialog.Portal>
          <Dialog.Overlay className="hj-dialog-backdrop" />
          <Dialog.Content className="hj-dialog-content">
            <Dialog.Title className="hj-visually-hidden">Post a healthcare job</Dialog.Title>
            <Dialog.Description className="hj-visually-hidden">Create a healthcare job listing for the Jorniz network.</Dialog.Description>
            <JobPostingForm onPosted={(job) => { setJobs((current) => [job, ...current]); setShowPostingForm(false); setNotice("Job published successfully."); }} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={Boolean(applyingTo)} onOpenChange={(open) => { if (!open) setApplyingTo(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="hj-dialog-backdrop" />
          <Dialog.Content className="hj-dialog-content">
            <Dialog.Title className="hj-visually-hidden">Apply for {applyingTo?.title}</Dialog.Title>
            <Dialog.Description className="hj-visually-hidden">Choose a CV and submit your application to this healthcare role.</Dialog.Description>
            {applyingTo ? <JobApplicationForm job={applyingTo} onApplied={(message) => { setApplyingTo(null); setNotice(message); setTab("applications"); void refreshApplications(); void refreshJobs(); }} /> : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
