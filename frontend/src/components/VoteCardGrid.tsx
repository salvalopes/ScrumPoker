import { VoteCard } from "./VoteCard";
import { pokerVoteValues } from "../config/poker";

type VoteCardGridProps = {
  selectedVote: number | null;
  disabled: boolean;
  onVote: (value: number) => void;
  onRemoveVote: () => void;
};

export function VoteCardGrid({ selectedVote, disabled, onVote, onRemoveVote }: VoteCardGridProps) {
  const mid = (pokerVoteValues.length - 1) / 2;
  return (
    <div className="deck-section">
      <div className="deck">
        {pokerVoteValues.map((value, i) => (
          <VoteCard
            key={value}
            value={value}
            index={i - mid}
            isSelected={selectedVote === value}
            disabled={disabled}
            onSelect={onVote}
            onDeselect={onRemoveVote}
          />
        ))}
      </div>
    </div>
  );
}
