import { useEffect, useMemo, useState } from "react";
import { Tabs } from "radix-ui";
import { Button } from "../../components/ui/Button";
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
    <Tabs.Root className="dc-page" value={tab} onValueChange={(value) => setTab(value as ConsultationPageTab)}>
      <header className="dc-page-heading workspace-page-heading">
        <div><h1>Doctor Consultations</h1><p className="workspace-page-tagline">Find verified healthcare professionals and book care.</p></div>
        <Tabs.List className="dc-tabs" aria-label="Consultation views">
          <Tabs.Trigger value="directory">Find a doctor</Tabs.Trigger>
          <Tabs.Trigger value="appointments">My appointments</Tabs.Trigger>
        </Tabs.List>
      </header>

      <Tabs.Content className="dc-tab-content" value="appointments">
        <MyAppointments />
      </Tabs.Content>
      <Tabs.Content className="dc-tab-content" value="directory">
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
            <div className="dc-error" role="alert"><p>{failure}</p><Button className="dc-retry-button" onClick={() => void refreshDoctors()}>Try again</Button></div>
          ) : loading ? (
            <p className="dc-status">Loading approved doctors...</p>
          ) : doctors.length === 0 ? (
            <div className="dc-empty"><strong>No approved doctors are available.</strong><span>Doctor profiles will appear after backend approval.</span></div>
          ) : (
            <DoctorDirectory doctors={visibleDoctors} onChooseDoctor={setSelectedDoctor} />
          )}
      </Tabs.Content>
      <AppointmentBookingDialog doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </Tabs.Root>
  );
}
