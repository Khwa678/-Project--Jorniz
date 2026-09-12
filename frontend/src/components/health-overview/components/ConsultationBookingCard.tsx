import { ArrowRight } from "lucide-react";
import { Button } from "../../ui/Button";

export interface ConsultationBookingCardProps {
  onBookConsultation?: () => void;
}

export function ConsultationBookingCard({ onBookConsultation }: ConsultationBookingCardProps) {
  return (
    <section className="consultation-booking-card">
      <span className="consultation-booking-icon" role="img" aria-label="Hospital">🏥</span>
      <div>
        <h2>Book a Consultation</h2>
        <p>Use your HU Coins with verified doctors</p>
      </div>
      <Button className="consultation-booking-action" onClick={onBookConsultation} disabled={!onBookConsultation}>
        Book Now
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </section>
  );
}
