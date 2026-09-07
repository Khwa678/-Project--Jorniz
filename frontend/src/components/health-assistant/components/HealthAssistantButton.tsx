export interface HealthAssistantButtonProps {
  onOpen: () => void;
}

export function HealthAssistantButton({ onOpen }: HealthAssistantButtonProps) {
  return (
    <button
      type="button"
      className="health-assistant-launcher"
      aria-label="Open scripted health guidance"
      onClick={onOpen}
    >
      <span aria-hidden="true">+</span>
      <strong>Health guide</strong>
    </button>
  );
}
