import type { Participant } from "../types/poker";

type ParticipantsListProps = {
  participants: Participant[];
};

export function ParticipantsList({ participants }: ParticipantsListProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Participants</p>
          <h2>Connected teammates</h2>
        </div>
        <span className="badge">{participants.length}</span>
      </div>

      <ul className="participants-list">
        {participants.map((participant) => (
          <li className="participant-card" key={participant.displayName}>
            <div>
              <strong>{participant.displayName}</strong>
              <p>{participant.hasVoted ? "Vote submitted" : "Waiting for vote"}</p>
            </div>
            <span className="participant-vote">
              {participant.vote ?? (participant.hasVoted ? "?" : "-")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
