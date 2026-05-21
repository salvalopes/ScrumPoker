import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParticipantsList } from "../components/ParticipantsList";
import { RoomActions } from "../components/RoomActions";
import { VoteCardGrid } from "../components/VoteCardGrid";
import { useDisplayName } from "../hooks/useDisplayName";
import { usePokerHub } from "../hooks/usePokerHub";
import type { Participant } from "../types/poker";

const MAX_SEATS = 10;

function RevealStat({ participants }: { participants: Participant[] }) {
  const votes = participants.map(p => p.vote).filter((v): v is number => v != null);
  if (!votes.length) return null;
  const avg = votes.reduce((a, b) => a + b, 0) / votes.length;
  const isConsensus = new Set(votes).size === 1;
  const min = Math.min(...votes);
  const max = Math.max(...votes);
  return (
    <span className="reveal-stat">
      {isConsensus
        ? <>Consensus <em>{min}</em></>
        : <>Spread <em>{min}–{max}</em></>}
      <span className="sub">avg {avg.toFixed(1)} · {votes.length} votes</span>
    </span>
  );
}

export function RoomPage() {
  const navigate = useNavigate();
  const { clearDisplayName, displayName } = useDisplayName();
  const { roomState, selectedVote, isConnecting, isConnected, error, vote, removeVote, revealVotes, resetVotes } =
    usePokerHub(displayName);

  const areVotesRevealed = Boolean(roomState?.areVotesRevealed);
  const participants = roomState?.participants ?? [];
  const votedCount = participants.filter(p => p.hasVoted).length;

  const canReveal = Boolean(
    roomState &&
      !areVotesRevealed &&
      participants.length > 0
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && canReveal) void revealVotes();
      if (e.key.toLowerCase() === "r" && areVotesRevealed) void resetVotes();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canReveal, areVotesRevealed, revealVotes, resetVotes]);

  return (
    <div className="stage">
      <header className="topbar">
        <div className="topbar-meta">
          <span className={`status-indicator${isConnected ? " online" : ""}`}>
            <span className="dot" />
            {isConnecting ? "Connecting" : isConnected ? "Live" : "Offline"}
          </span>
          <span className="sep">/</span>
          <span className="you">{displayName}</span>
          <button
            className="btn ghost"
            type="button"
            onClick={() => { clearDisplayName(); navigate("/", { replace: true }); }}
          >
            Leave
          </button>
        </div>
      </header>

      {error ? (
        <section className="error-panel">
          <h2>Unable to join the room</h2>
          <p>{error}</p>
          <button
            className="btn"
            type="button"
            onClick={() => { clearDisplayName(); navigate("/", { replace: true }); }}
          >
            Pick another display name
          </button>
        </section>
      ) : null}

      <main className="bench">
        <div className="lane-label">
          <span>
            Table — {participants.length} of {MAX_SEATS}{" "}
            {participants.length === 1 ? "seat" : "seats"}
          </span>
          {areVotesRevealed
            ? <RevealStat participants={participants} />
            : <span className="count">
                <em>{votedCount}</em> / {participants.length} voted
              </span>
          }
        </div>

        <ParticipantsList
          participants={participants}
          areVotesRevealed={areVotesRevealed}
          displayName={displayName}
        />

        <VoteCardGrid
          disabled={isConnecting || !isConnected || areVotesRevealed}
          selectedVote={selectedVote}
          onVote={(value) => void vote(value)}
          onRemoveVote={() => void removeVote()}
        />
      </main>

      <RoomActions
        canReveal={canReveal}
        isBusy={isConnecting || !isConnected}
        areVotesRevealed={areVotesRevealed}
        onReveal={() => void revealVotes()}
        onReset={() => void resetVotes()}
      />
    </div>
  );
}
