import { ConsultationPaymentChoice } from "./ConsultationPaymentChoice";
import type { DoctorProfile } from "../api/requests";

export interface AppointmentBookingDialogProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
}

export function AppointmentBookingDialog({ doctor, onClose }: AppointmentBookingDialogProps) {
  if (!doctor) return null;

  return (
    <div className="dc-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dc-dialog" role="dialog" aria-modal="true" aria-labelledby="dc-booking-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><span>Appointment request</span><h2 id="dc-booking-title">{doctor.name}</h2></div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <div className="dc-unavailable-block">
          <strong>Online booking is temporarily unavailable.</strong>
          <span>Jorniz can list approved doctors, but the backend has no endpoint that returns trustworthy available slots for this doctor. No appointment has been created.</span>
        </div>
        <ConsultationPaymentChoice />
      </section>
    </div>
  );
}
