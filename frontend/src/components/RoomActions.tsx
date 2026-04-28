type RoomActionsProps = {
  canReveal: boolean;
  isBusy: boolean;
  onReveal: () => void;
  onReset: () => void;
};

export function RoomActions({
  canReveal,
  isBusy,
  onReveal,
  onReset
}: RoomActionsProps) {
  return (
    <section className="panel actions-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Room controls</p>
          <h2>Reveal or start again</h2>
        </div>
      </div>

      <div className="actions-row">
        <button
          className="primary-button"
          disabled={!canReveal || isBusy}
          onClick={onReveal}
          type="button"
        >
          Reveal votes
        </button>
        <button className="secondary-button" disabled={isBusy} onClick={onReset} type="button">
          Reset room
        </button>
      </div>
    </section>
  );
}
