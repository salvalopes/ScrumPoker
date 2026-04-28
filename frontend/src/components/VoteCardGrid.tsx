import { VoteCard } from "./VoteCard";
import { pokerVoteValues } from "../config/poker";

type VoteCardGridProps = {
  selectedVote: number | null;
  disabled: boolean;
  onVote: (value: number) => void;
};

export function VoteCardGrid({
  selectedVote,
  disabled,
  onVote
}: VoteCardGridProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Voting deck</p>
          <h2>Choose an estimate</h2>
        </div>
      </div>

      <div className="vote-grid">
        {pokerVoteValues.map((value) => (
          <VoteCard
            disabled={disabled}
            isSelected={selectedVote === value}
            key={value}
            value={value}
            onSelect={onVote}
          />
        ))}
      </div>
    </section>
  );
}
