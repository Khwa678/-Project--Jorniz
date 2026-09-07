export interface VoiceVideoCallScreenProps {
  memberName?: string;
}

export function VoiceVideoCallScreen({ memberName }: VoiceVideoCallScreenProps) {
  return (
    <aside className="dm-call-unavailable" aria-label="Calling availability">
      <strong>Voice and video calls are not available in this React page yet.</strong>
      <span>
        {memberName ? `Calls with ${memberName}` : "Calls"} will be enabled after authenticated room access and production TURN connectivity are available.
      </span>
    </aside>
  );
}
