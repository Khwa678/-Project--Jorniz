import { useEffect, useMemo, useState } from "react";
import { AppointmentBookingDialog } from "./components/AppointmentBookingDialog";
import { DoctorDirectory } from "./components/DoctorDirectory";
import { DoctorSearchFilters, type DoctorSort } from "./components/DoctorSearchFilters";
import { MyAppointments } from "./components/MyAppointments";
import { loadApprovedDoctors, type DoctorProfile } from "./api/requests";
import "./styles.css";

type ConsultationPageTab = "directory" | "appointments";

function failureText(error: unknown) {
  return error instanceof Error ? error.message : "Could not load the doctor directory.";
}

export function DoctorConsultationsPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [sortBy, setSortBy] = useState<DoctorSort>("rating");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [tab, setTab] = useState<ConsultationPageTab>("directory");

  const refreshDoctors = async () => {
    setLoading(true);
    try {
      setDoctors(await loadApprovedDoctors());
      setFailure(null);
    } catch (error) {
      setFailure(failureText(error));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refreshDoctors(); }, []);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.specialty))).sort(),
    [doctors],
  );

  const visibleDoctors = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const filtered = doctors.filter((doctor) => {
      const matchesSpecialty = specialty === "All" || doctor.specialty === specialty;
      const matchesSearch = !query || [doctor.name, doctor.specialty, doctor.hospital, doctor.location]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      return matchesSpecialty && matchesSearch;
    });
    return filtered.sort((left, right) => {
      if (sortBy === "price-low") return left.consultation_fee - right.consultation_fee;
      if (sortBy === "price-high") return right.consultation_fee - left.consultation_fee;
      if (sortBy === "experience") return right.experience_years - left.experience_years;
      return right.rating - left.rating;
    });
  }, [doctors, searchText, sortBy, specialty]);

  return (
    <section className="dc-page">
      <header className="dc-page-heading">
        <div><span>Verified care directory</span><h1>Doctor consultations</h1><p>Browse approved healthcare professionals without mixing in demo profiles.</p></div>
        <div className="dc-tabs">
          <button type="button" className={tab === "directory" ? "is-active" : ""} onClick={() => setTab("directory")}>Find a doctor</button>
          <button type="button" className={tab === "appointments" ? "is-active" : ""} onClick={() => setTab("appointments")}>My appointments</button>
        </div>
      </header>

      {tab === "appointments" ? <MyAppointments /> : (
        <>
          <DoctorSearchFilters
            searchText={searchText}
            selectedSpecialty={specialty}
            sortBy={sortBy}
            specialties={specialties}
            onSearchChange={setSearchText}
            onSortChange={setSortBy}
            onSpecialtyChange={setSpecialty}
          />
          {failure ? (
            <div className="dc-error" role="alert"><p>{failure}</p><button type="button" onClick={() => void refreshDoctors()}>Try again</button></div>
          ) : loading ? (
            <p className="dc-status">Loading approved doctors...</p>
          ) : doctors.length === 0 ? (
            <div className="dc-empty"><strong>No approved doctors are available.</strong><span>Doctor profiles will appear after backend approval.</span></div>
          ) : (
            <DoctorDirectory doctors={visibleDoctors} onChooseDoctor={setSelectedDoctor} />
          )}
        </>
      )}
      <AppointmentBookingDialog doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </section>
  );
}
