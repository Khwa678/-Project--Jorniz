import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { SearchBar } from "../../components/SearchBar";

export interface RewardsToolbarProps {
  query: string;
  canAdjust: boolean;
  onQueryChange: (value: string) => void;
  onAdjust: () => void;
}

export function RewardsToolbar(props: RewardsToolbarProps) {
  return <div className="admin-rewards-toolbar"><SearchBar value={props.query} section="reward activity" onValueChange={props.onQueryChange} />{props.canAdjust ? <Button size="small" onClick={props.onAdjust}><Plus size={15} /> Adjust HU Coins</Button> : null}</div>;
}
