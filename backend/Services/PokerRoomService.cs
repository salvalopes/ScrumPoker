using backend.Contracts;
using backend.Models;

namespace backend.Services;

public sealed class PokerRoomService : IPokerRoomService
{
    private static readonly HashSet<int> AllowedVotes = [1, 2, 3, 5, 8, 13, 20, 40, 100];

    private readonly object _syncRoot = new();
    private readonly PokerRoomState _roomState = new();

    public RoomStateDto GetRoomState()
    {
        lock (_syncRoot)
        {
            return CreateRoomStateDto();
        }
    }

    public RoomStateDto JoinRoom(string connectionId, string displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            throw new InvalidOperationException("Display name is required.");
        }

        var normalizedDisplayName = displayName.Trim();

        lock (_syncRoot)
        {
            var duplicateExists = _roomState.Participants.Any(participant =>
                !string.Equals(participant.ConnectionId, connectionId, StringComparison.Ordinal) &&
                string.Equals(participant.DisplayName, normalizedDisplayName, StringComparison.OrdinalIgnoreCase));

            if (duplicateExists)
            {
                throw new InvalidOperationException("A participant with this display name is already connected.");
            }

            var existingParticipant = _roomState.Participants.FirstOrDefault(participant =>
                string.Equals(participant.ConnectionId, connectionId, StringComparison.Ordinal));

            if (existingParticipant is null)
            {
                _roomState.Participants.Add(new PokerParticipant
                {
                    ConnectionId = connectionId,
                    DisplayName = normalizedDisplayName
                });
            }
            else
            {
                existingParticipant.DisplayName = normalizedDisplayName;
            }

            return CreateRoomStateDto();
        }
    }

    public RoomStateDto Vote(string connectionId, int vote)
    {
        if (!AllowedVotes.Contains(vote))
        {
            throw new InvalidOperationException("Invalid vote value.");
        }

        lock (_syncRoot)
        {
            if (_roomState.AreVotesRevealed)
            {
                throw new InvalidOperationException("Voting is disabled after reveal. Reset the room first.");
            }

            var participant = FindParticipant(connectionId);
            participant.Vote = vote;

            return CreateRoomStateDto();
        }
    }

    public RoomStateDto RevealVotes()
    {
        lock (_syncRoot)
        {
            _roomState.AreVotesRevealed = true;
            return CreateRoomStateDto();
        }
    }

    public RoomStateDto ResetVotes()
    {
        lock (_syncRoot)
        {
            _roomState.AreVotesRevealed = false;

            foreach (var participant in _roomState.Participants)
            {
                participant.Vote = null;
            }

            return CreateRoomStateDto();
        }
    }

    public RoomStateDto RemoveParticipant(string connectionId)
    {
        lock (_syncRoot)
        {
            var participant = _roomState.Participants.FirstOrDefault(currentParticipant =>
                string.Equals(currentParticipant.ConnectionId, connectionId, StringComparison.Ordinal));

            if (participant is not null)
            {
                _roomState.Participants.Remove(participant);
            }

            if (_roomState.Participants.Count == 0)
            {
                _roomState.AreVotesRevealed = false;
            }

            return CreateRoomStateDto();
        }
    }

    private PokerParticipant FindParticipant(string connectionId)
    {
        return _roomState.Participants.FirstOrDefault(participant =>
                   string.Equals(participant.ConnectionId, connectionId, StringComparison.Ordinal))
               ?? throw new InvalidOperationException("Participant is not connected to the room.");
    }

    private RoomStateDto CreateRoomStateDto()
    {
        var participants = _roomState.Participants
            .OrderBy(participant => participant.DisplayName, StringComparer.OrdinalIgnoreCase)
            .Select(participant => new ParticipantDto(
                participant.DisplayName,
                participant.Vote.HasValue,
                _roomState.AreVotesRevealed ? participant.Vote : null))
            .ToArray();

        return new RoomStateDto(participants, _roomState.AreVotesRevealed);
    }
}
