type RoomActionsProps = {
  canReveal: boolean;
  isBusy: boolean;
  areVotesRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
};

export function RoomActions({ canReveal, isBusy, areVotesRevealed, onReveal, onReset }: RoomActionsProps) {
  return (
    <footer className="action-rail">
      <div className="action-hint">
        {areVotesRevealed
          ? <>Press <kbd>R</kbd> to reset</>
          : <>Pick a card · <kbd>Enter</kbd> to reveal when everyone has voted</>}
      </div>
      <div className="actions-row">
        {areVotesRevealed ? (
          <button className="btn primary" onClick={onReset} type="button">
            Next round
          </button>
        ) : (
          <>
            <button className="btn" disabled={isBusy} onClick={onReset} type="button">
              Reset
            </button>
            <button
              className="btn primary"
              disabled={!canReveal || isBusy}
              onClick={onReveal}
              type="button"
            >
              Reveal votes
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
