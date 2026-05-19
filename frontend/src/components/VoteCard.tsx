import type { CSSProperties } from "react";

type VoteCardProps = {
  value: number;
  index: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (value: number) => void;
  onDeselect: () => void;
};

export function VoteCard({ value, index, isSelected, disabled, onSelect, onDeselect }: VoteCardProps) {
  return (
    <button
      className={`deck-card${isSelected ? " selected" : ""}`}
      style={{
        "--i": index,
        animationDelay: `${(index + 4) * 50 + 200}ms`,
      } as CSSProperties}
      disabled={disabled}
      onClick={() => isSelected ? onDeselect() : onSelect(value)}
      type="button"
    >
      <span className="corner-tl">{value}</span>
      <span className="face">{value}</span>
      <span className="corner-br">{value}</span>
    </button>
  );
}
