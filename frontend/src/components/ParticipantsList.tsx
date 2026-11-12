import {useMemo, type CSSProperties} from "react";
import type {Participant} from "../types/poker";

type ParticipantsListProps = {
    participants: Participant[];
    areVotesRevealed: boolean;
    displayName: string;
};

// Converte o voto num número ordenável:
// - votos numéricos ("1", "13", 0.5, ...) → o próprio valor
// - votos não numéricos ("?", "☕", ...) → depois dos numéricos
// - sem voto → no fim
function voteRank(vote: Participant["vote"]): number {
    if (vote == null) return Number.MAX_VALUE;
    const n = typeof vote === "number" ? vote : parseFloat(String(vote));
    return Number.isNaN(n) ? Number.MAX_VALUE / 2 : n;
}

function byName(a: Participant, b: Participant): number {
    return a.displayName.localeCompare(b.displayName);
}

export function ParticipantsList({participants, areVotesRevealed, displayName}: ParticipantsListProps) {
    const cols = Math.min(5, Math.max(1, participants.length));

    // Ordena uma cópia — nunca mutar a prop/estado do pai.
    const sortedParticipants = useMemo(() => {
        const copy = [...participants];
        return areVotesRevealed
            ? copy.sort((a, b) => voteRank(a.vote) - voteRank(b.vote) || byName(a, b))
            : copy.sort(byName);
    }, [participants, areVotesRevealed]);

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
