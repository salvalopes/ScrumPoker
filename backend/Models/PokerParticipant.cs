namespace backend.Models;

public sealed class PokerParticipant
{
    public required string ConnectionId { get; init; }

    public required string DisplayName { get; set; }

    public int? Vote { get; set; }
}
