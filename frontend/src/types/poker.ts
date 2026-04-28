export type Participant = {
  displayName: string;
  hasVoted: boolean;
  vote: number | null;
};

export type RoomState = {
  participants: Participant[];
  areVotesRevealed: boolean;
};
