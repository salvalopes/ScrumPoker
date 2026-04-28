import { useNavigate } from "react-router-dom";
import { ParticipantsList } from "../components/ParticipantsList";
import { RoomActions } from "../components/RoomActions";
import { VoteCardGrid } from "../components/VoteCardGrid";
import { useDisplayName } from "../hooks/useDisplayName";
import { usePokerHub } from "../hooks/usePokerHub";

export function RoomPage() {
  const navigate = useNavigate();
  const { clearDisplayName, displayName } = useDisplayName();
  const { roomState, selectedVote, isConnecting, isConnected, error, vote, revealVotes, resetVotes } =
    usePokerHub(displayName);

  const handleClearName = () => {
    clearDisplayName();
    navigate("/", { replace: true });
  };

  const canReveal = Boolean(
    roomState &&
      !roomState.areVotesRevealed &&
      roomState.participants.length > 0 &&
      roomState.participants.every((participant) => participant.hasVoted)
  );

  return (
    <main className="screen room-screen">
      <section className="hero">
        <div>
          <p className="eyebrow">Scrum Poker</p>
          <h1>One room, one round, clear estimates</h1>
          <p>
            Connected as <strong>{displayName}</strong>. Votes stay hidden until
            someone reveals them, and no one can vote again until the room is
            reset.
          </p>
        </div>

        <div className="hero-status">
          <span className={`status-pill${isConnected ? " online" : ""}`}>
            {isConnecting ? "Connecting..." : isConnected ? "Live" : "Offline"}
          </span>
          <button className="ghost-button" onClick={handleClearName} type="button">
            Change name
          </button>
        </div>
      </section>

      {error ? (
        <section className="panel error-panel">
          <h2>Unable to join the room</h2>
          <p>{error}</p>
          <button className="secondary-button" onClick={handleClearName} type="button">
            Pick another display name
          </button>
        </section>
      ) : null}

      <div className="room-layout">
        <ParticipantsList participants={roomState?.participants ?? []} />

        <div className="room-main">
          <VoteCardGrid
            disabled={isConnecting || !isConnected || Boolean(roomState?.areVotesRevealed)}
            selectedVote={selectedVote}
            onVote={(value) => void vote(value)}
          />

          <RoomActions
            canReveal={canReveal}
            isBusy={isConnecting || !isConnected}
            onReveal={() => void revealVotes()}
            onReset={() => void resetVotes()}
          />
        </div>
      </div>
    </main>
  );
}
