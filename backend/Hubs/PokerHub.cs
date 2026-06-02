using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public sealed class PokerHub(IPokerRoomService pokerRoomService) : Hub
{
    public async Task<HubActionResultDto> JoinRoom(string roomId, string displayName)
    {
        if (!IsValidRoomId(roomId))
        {
            return new HubActionResultDto(false, "Invalid room ID.");
        }

        Context.Items["roomId"] = roomId;
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        return await BroadcastRoomStateAsync(roomId, () => pokerRoomService.JoinRoom(roomId, Context.ConnectionId, displayName));
    }

    public Task<HubActionResultDto> Vote(string roomId, int vote)
    {
        if (!IsValidRoomId(roomId))
        {
            return Task.FromResult(new HubActionResultDto(false, "Invalid room ID."));
        }

        return BroadcastRoomStateAsync(roomId, () => pokerRoomService.Vote(roomId, Context.ConnectionId, vote));
    }

    public Task<HubActionResultDto> RemoveVote(string roomId)
    {
        if (!IsValidRoomId(roomId))
        {
            return Task.FromResult(new HubActionResultDto(false, "Invalid room ID."));
        }

        return BroadcastRoomStateAsync(roomId, () => pokerRoomService.RemoveVote(roomId, Context.ConnectionId));
    }

    public Task<HubActionResultDto> RevealVotes(string roomId)
    {
        if (!IsValidRoomId(roomId))
        {
            return Task.FromResult(new HubActionResultDto(false, "Invalid room ID."));
        }

        return BroadcastRoomStateAsync(roomId, () => pokerRoomService.RevealVotes(roomId));
    }

    public Task<HubActionResultDto> ResetVotes(string roomId)
    {
        if (!IsValidRoomId(roomId))
        {
            return Task.FromResult(new HubActionResultDto(false, "Invalid room ID."));
        }

        return BroadcastRoomStateAsync(roomId, () => pokerRoomService.ResetVotes(roomId));
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue("roomId", out var roomIdObj) && roomIdObj is string roomId)
        {
            var roomState = pokerRoomService.RemoveParticipant(roomId, Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("RoomStateUpdated", roomState);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task<HubActionResultDto> BroadcastRoomStateAsync(string roomId, Func<RoomStateDto> updateRoomState)
    {
        try
        {
            var roomState = updateRoomState();
            await Clients.Group(roomId).SendAsync("RoomStateUpdated", roomState);
            return new HubActionResultDto(true);
        }
        catch (InvalidOperationException exception)
        {
            return new HubActionResultDto(false, exception.Message);
        }
    }

    private static bool IsValidRoomId(string roomId) =>
        !string.IsNullOrEmpty(roomId) &&
        roomId.Length <= 20 &&
        roomId.All(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'));
}
