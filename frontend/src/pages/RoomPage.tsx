import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ParticipantsList } from "../components/ParticipantsList";
import { RoomActions } from "../components/RoomActions";
import { VoteCardGrid } from "../components/VoteCardGrid";
import { useDisplayName } from "../hooks/useDisplayName";
import { usePokerHub } from "../hooks/usePokerHub";
import { useRoomId } from "../hooks/useRoomId";
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

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ScrumPoker", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  }

  return (
    <button className="btn ghost" type="button" onClick={() => void handleShare()}>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

export function RoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { clearDisplayName, displayName } = useDisplayName();
  const { setRoomId, clearRoomId } = useRoomId();
  const { roomState, selectedVote, isConnecting, isConnected, error, vote, removeVote, revealVotes, resetVotes } =
    usePokerHub(roomId ?? "", displayName);

  // Save the URL's roomId to cookie — link sharing has priority over the stored cookie
  useEffect(() => {
    if (roomId) setRoomId(roomId);
  }, [roomId, setRoomId]);

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

  function handleLeave() {
    clearRoomId();
    clearDisplayName();
    navigate("/", { replace: true });
  }

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
          <ShareButton />
          <button
            className="btn ghost"
            type="button"
            onClick={handleLeave}
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
