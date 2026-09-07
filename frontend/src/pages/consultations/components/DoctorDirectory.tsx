import type { DoctorProfile } from "../api/requests";

export interface DoctorDirectoryProps {
  doctors: DoctorProfile[];
  onChooseDoctor: (doctor: DoctorProfile) => void;
}

export function DoctorDirectory({ doctors, onChooseDoctor }: DoctorDirectoryProps) {
  if (doctors.length === 0) {
    return (
      <div className="dc-empty">
        <strong>No approved doctors match these filters.</strong>
        <span>Try another specialty or search phrase.</span>
      </div>
    );
  }

  return (
    <div className="dc-directory">
      {doctors.map((doctor) => (
        <article className="dc-doctor-card" key={doctor.id}>
          <div className="dc-doctor-heading">
            {doctor.avatar ? <img src={doctor.avatar} alt="" /> : <span>{doctor.name.slice(0, 1)}</span>}
            <div>
              <h2>{doctor.name}</h2>
              <p>{doctor.specialty}</p>
              <small>{[doctor.hospital, doctor.location].filter(Boolean).join(" | ") || "Online practice"}</small>
            </div>
          </div>
          {doctor.bio ? <p className="dc-bio">{doctor.bio}</p> : null}
          <div className="dc-doctor-facts">
            <span><strong>{doctor.rating || "New"}</strong> rating</span>
            <span><strong>{doctor.experience_years}</strong> years</span>
            <span><strong>INR {doctor.consultation_fee}</strong> fee</span>
          </div>
          {doctor.available_days.length > 0 ? (
            <p className="dc-days">Listed days: {doctor.available_days.join(", ")}</p>
          ) : null}
          <button type="button" onClick={() => onChooseDoctor(doctor)}>Check booking availability</button>
        </article>
      ))}
    </div>
  );
}
