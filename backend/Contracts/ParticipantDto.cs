namespace backend.Contracts;

public sealed record ParticipantDto(string DisplayName, bool HasVoted, int? Vote);
