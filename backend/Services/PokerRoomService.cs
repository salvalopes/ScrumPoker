using backend.Contracts;
using backend.Models;

namespace backend.Services;

public sealed class PokerRoomService : IPokerRoomService
{
    private static readonly HashSet<int> AllowedVotes = [1, 2, 3, 5, 8, 13, 20, 40, 100];

    private readonly object _syncRoot = new();
    private readonly Dictionary<string, PokerRoomState> _rooms = new();

    public RoomStateDto GetRoomState(string roomId)
    {
        ValidateRoomId(roomId);

        lock (_syncRoot)
        {
            return _rooms.TryGetValue(roomId, out var room)
                ? CreateRoomStateDto(room)
                : new RoomStateDto([], false);
        }
    }

    public RoomStateDto JoinRoom(string roomId, string connectionId, string displayName)
    {
        ValidateRoomId(roomId);

        if (string.IsNullOrWhiteSpace(displayName))
        {
            throw new InvalidOperationException("Display name is required.");
        }

        var normalizedDisplayName = displayName.Trim();

        lock (_syncRoot)
        {
            var room = GetOrCreateRoom(roomId);

            var duplicateExists = room.Participants.Any(participant =>
                !string.Equals(participant.ConnectionId, connectionId, StringComparison.Ordinal) &&
                string.Equals(participant.DisplayName, normalizedDisplayName, StringComparison.OrdinalIgnoreCase));

            if (duplicateExists)
            {
                throw new InvalidOperationException("A participant with this display name is already connected.");
            }

            var existingParticipant = room.Participants.FirstOrDefault(participant =>
                string.Equals(participant.ConnectionId, connectionId, StringComparison.Ordinal));

            if (existingParticipant is null)
            {
                room.Participants.Add(new PokerParticipant
                {
                    ConnectionId = connectionId,
                    DisplayName = normalizedDisplayName
                });
            }
            else
            {
                existingParticipant.DisplayName = normalizedDisplayName;
            }

            return CreateRoomStateDto(room);
        }
    }

    public RoomStateDto Vote(string roomId, string connectionId, int vote)
    {
        ValidateRoomId(roomId);

        if (!AllowedVotes.Contains(vote))
        {
            throw new InvalidOperationException("Invalid vote value.");
        }

        lock (_syncRoot)
        {
            var room = RequireRoom(roomId);

            if (room.AreVotesRevealed)
            {
                throw new InvalidOperationException("Voting is disabled after reveal. Reset the room first.");
            }

            FindParticipant(room, connectionId).Vote = vote;
            return CreateRoomStateDto(room);
        }
    }

    public RoomStateDto RemoveVote(string roomId, string connectionId)
    {
        ValidateRoomId(roomId);

        lock (_syncRoot)
        {
            var room = RequireRoom(roomId);

            if (room.AreVotesRevealed)
            {
                throw new InvalidOperationException("Voting is disabled after reveal. Reset the room first.");
            }

            FindParticipant(room, connectionId).Vote = null;
            return CreateRoomStateDto(room);
        }
    }

    public RoomStateDto RevealVotes(string roomId)
    {
        ValidateRoomId(roomId);

        lock (_syncRoot)
        {
            var room = RequireRoom(roomId);
            room.AreVotesRevealed = true;
            return CreateRoomStateDto(room);
        }
    }

    public RoomStateDto ResetVotes(string roomId)
    {
        ValidateRoomId(roomId);

        lock (_syncRoot)
        {
            var room = RequireRoom(roomId);
            room.AreVotesRevealed = false;

            foreach (var participant in room.Participants)
            {
                participant.Vote = null;
            }

            return CreateRoomStateDto(room);
        }
    }

    public RoomStateDto RemoveParticipant(string roomId, string connectionId)
    {
        lock (_syncRoot)
        {
            if (!_rooms.TryGetValue(roomId, out var room))
            {
                return new RoomStateDto([], false);
            }

            var participant = room.Participants.FirstOrDefault(p =>
                string.Equals(p.ConnectionId, connectionId, StringComparison.Ordinal));

            if (participant is not null)
            {
                room.Participants.Remove(participant);
            }

            if (room.Participants.Count == 0)
            {
                _rooms.Remove(roomId);
                return new RoomStateDto([], false);
            }

            return CreateRoomStateDto(room);
        }
    }

    private PokerRoomState GetOrCreateRoom(string roomId)
    {
        if (!_rooms.TryGetValue(roomId, out var room))
        {
            room = new PokerRoomState();
            _rooms[roomId] = room;
        }

        return room;
    }

    private PokerRoomState RequireRoom(string roomId)
    {
        return _rooms.TryGetValue(roomId, out var room)
            ? room
            : throw new InvalidOperationException("Room not found.");
    }

    private static PokerParticipant FindParticipant(PokerRoomState room, string connectionId)
    {
        return room.Participants.FirstOrDefault(p =>
                   string.Equals(p.ConnectionId, connectionId, StringComparison.Ordinal))
               ?? throw new InvalidOperationException("Participant is not connected to the room.");
    }

    private static RoomStateDto CreateRoomStateDto(PokerRoomState room)
    {
        var participants = room.Participants
            .OrderBy(p => p.DisplayName, StringComparer.OrdinalIgnoreCase)
            .Select(p => new ParticipantDto(
                p.DisplayName,
                p.Vote.HasValue,
                room.AreVotesRevealed ? p.Vote : null))
            .ToArray();

        return new RoomStateDto(participants, room.AreVotesRevealed);
    }

    private static void ValidateRoomId(string roomId)
    {
        if (string.IsNullOrEmpty(roomId) ||
            roomId.Length > 20 ||
            !roomId.All(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')))
        {
            throw new InvalidOperationException("Invalid room ID.");
        }
    }
}
