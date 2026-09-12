import { Dialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import { ConsultationPaymentChoice } from "./ConsultationPaymentChoice";
import type { DoctorProfile } from "../api/requests";

export interface AppointmentBookingDialogProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
}

export function AppointmentBookingDialog({ doctor, onClose }: AppointmentBookingDialogProps) {
  if (!doctor) return null;

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dc-dialog-backdrop" />
        <Dialog.Content className="dc-dialog">
          <header>
            <div>
              <span>Appointment request</span>
              <Dialog.Title id="dc-booking-title">{doctor.name}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button size="small" variant="secondary">Close</Button>
            </Dialog.Close>
          </header>
          <Dialog.Description asChild>
            <div className="dc-unavailable-block">
              <strong>Online booking is temporarily unavailable.</strong>
              <span>Jorniz can list approved doctors, but the backend has no endpoint that returns trustworthy available slots for this doctor. No appointment has been created.</span>
            </div>
          </Dialog.Description>
          <ConsultationPaymentChoice />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
