namespace backend.Models;

public sealed class PokerRoomState
{
    public List<PokerParticipant> Participants { get; } = [];

    public bool AreVotesRevealed { get; set; }
}
