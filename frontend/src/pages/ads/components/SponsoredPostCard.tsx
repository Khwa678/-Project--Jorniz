import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import {
  recordSponsoredClick,
  recordSponsoredImpression,
  type SponsoredPlacement,
} from "../api/requests";

export interface SponsoredPostCardProps {
  placement: SponsoredPlacement;
  onConfirmedCoins?: (coins: number) => void;
}

export function SponsoredPostCard({ placement, onConfirmedCoins }: SponsoredPostCardProps) {
  const impressionRecorded = useRef(false);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (impressionRecorded.current) return;
    impressionRecorded.current = true;
    void recordSponsoredImpression(placement.id, placement.creativeId).catch(() => {
      setFailure("This impression could not be confirmed.");
    });
  }, [placement.creativeId, placement.id]);

  async function openSponsoredDestination() {
    setFailure("");
    try {
      const result = await recordSponsoredClick(placement.id, placement.creativeId);
      if (typeof result.hu_coins === "number") onConfirmedCoins?.(result.hu_coins);
      if (placement.destinationUrl) window.open(placement.destinationUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The sponsored link could not be opened.");
    }
  }

  return (
    <article className="sponsored-post-card">
      <span>Sponsored</span>
      {placement.imageUrl && <img src={placement.imageUrl} alt="" />}
      <h3>{placement.headline || placement.name}</h3>
      <p>{placement.bodyText}</p>
      <Button type="button" onClick={() => void openSponsoredDestination()}>{placement.callToAction}</Button>
      {failure && <small role="status">{failure}</small>}
    </article>
  );
}
