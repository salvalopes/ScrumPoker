namespace backend.Contracts;

public sealed record RoomStateDto(IReadOnlyList<ParticipantDto> Participants, bool AreVotesRevealed);
