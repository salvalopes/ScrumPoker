export const pokerVoteValues = [1, 2, 3, 5, 8, 13, 20, 40, 100] as const;

export const pokerHubEvents = {
  roomStateUpdated: "RoomStateUpdated"
} as const;

export const pokerHubMethods = {
  joinRoom: "JoinRoom",
  vote: "Vote",
  removeVote: "RemoveVote",
  revealVotes: "RevealVotes",
  resetVotes: "ResetVotes"
} as const;
