type VoteCardProps = {
  value: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (value: number) => void;
};

export function VoteCard({ value, isSelected, disabled, onSelect }: VoteCardProps) {
  return (
    <button
      className={`vote-card${isSelected ? " selected" : ""}`}
      disabled={disabled}
      onClick={() => onSelect(value)}
      type="button"
    >
      {value}
    </button>
  );
}
