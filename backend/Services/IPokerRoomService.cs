using backend.Contracts;

namespace backend.Services;

public interface IPokerRoomService
{
    RoomStateDto GetRoomState();

    RoomStateDto JoinRoom(string connectionId, string displayName);

    RoomStateDto Vote(string connectionId, int vote);

    RoomStateDto RevealVotes();

    RoomStateDto ResetVotes();

    RoomStateDto RemoveParticipant(string connectionId);
}
