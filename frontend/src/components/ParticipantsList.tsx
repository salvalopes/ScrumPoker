import type {CSSProperties} from "react";
import type {Participant} from "../types/poker";

type ParticipantsListProps = {
    participants: Participant[];
    areVotesRevealed: boolean;
    displayName: string;
};

export function ParticipantsList({participants, areVotesRevealed, displayName}: ParticipantsListProps) {
    const cols = Math.min(5, Math.max(1, participants.length));

    const sortedParticipants = areVotesRevealed
        ? participants.sort(p => p.vote ?? 0)
        : participants.sort((p1, p2) => p1.displayName.localeCompare((p2.displayName)));

    return (
        <div className="lanes-area">
            <div className="lanes" style={{"--cols": cols} as CSSProperties}>
                {sortedParticipants.map((p, i) => {
                    const isSelf = p.displayName === displayName;
                    const flipped = areVotesRevealed && p.hasVoted;
                    return (
                        <div key={p.displayName} className={`lane${isSelf ? " self" : ""}`}>
                            <div className={`mini-card${flipped ? " flipped" : ""}${!p.hasVoted ? " pending" : ""}`}>
                                <div
                                    className="mini-card-inner"
                                    style={{"--d": `${i * 110}ms`} as CSSProperties}
                                >
                                    <div className="mini-card-face mini-card-back">
                                        <span className="mini-card-pip">{p.hasVoted ? "✓" : "—"}</span>
                                    </div>
                                    <div className={`mini-card-face mini-card-front${p.vote == null ? " empty" : ""}`}>
                                        {p.vote == null ? "?" : p.vote}
                                    </div>
                                </div>
                            </div>
                            <div className="lane-meta">
                                <div className="name">{p.displayName}</div>
                                <div className="role">
                                    {isSelf ? "You" : (p.hasVoted ? "Voted" : "Thinking…")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
