import type { JobApplication } from "../api/requests";

export interface MyJobApplicationsProps {
  applications: JobApplication[];
  failure?: string | null;
  loading: boolean;
}

export function MyJobApplications({ applications, failure, loading }: MyJobApplicationsProps) {
  if (loading) return <p className="hj-status">Loading your applications...</p>;
  if (failure) return <div className="hj-error" role="alert">{failure}</div>;
  if (applications.length === 0) return <div className="hj-empty"><strong>No applications yet.</strong><span>Applications submitted through Jorniz will appear here.</span></div>;

  return (
    <div className="hj-applications">
      {applications.map((application) => (
        <article key={application.id}>
          <div><h2>{application.title}</h2><p>{application.company} | {application.location}</p></div>
          <span>{application.status}</span>
        </article>
      ))}
    </div>
  );
}
