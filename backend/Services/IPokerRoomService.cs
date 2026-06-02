using backend.Contracts;

namespace backend.Services;

public interface IPokerRoomService
{
    RoomStateDto GetRoomState(string roomId);

    RoomStateDto JoinRoom(string roomId, string connectionId, string displayName);

    RoomStateDto Vote(string roomId, string connectionId, int vote);

    RoomStateDto RemoveVote(string roomId, string connectionId);

    RoomStateDto RevealVotes(string roomId);

    RoomStateDto ResetVotes(string roomId);

    RoomStateDto RemoveParticipant(string roomId, string connectionId);
}
