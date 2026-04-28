using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public sealed class PokerHub(IPokerRoomService pokerRoomService) : Hub
{
    public Task<HubActionResultDto> JoinRoom(string displayName)
    {
        return BroadcastRoomStateAsync(() => pokerRoomService.JoinRoom(Context.ConnectionId, displayName));
    }

    public Task<HubActionResultDto> Vote(int vote)
    {
        return BroadcastRoomStateAsync(() => pokerRoomService.Vote(Context.ConnectionId, vote));
    }

    public Task<HubActionResultDto> RevealVotes()
    {
        return BroadcastRoomStateAsync(pokerRoomService.RevealVotes);
    }

    public Task<HubActionResultDto> ResetVotes()
    {
        return BroadcastRoomStateAsync(pokerRoomService.ResetVotes);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomState = pokerRoomService.RemoveParticipant(Context.ConnectionId);
        await Clients.All.SendAsync("RoomStateUpdated", roomState);
        await base.OnDisconnectedAsync(exception);
    }

    private async Task<HubActionResultDto> BroadcastRoomStateAsync(Func<RoomStateDto> updateRoomState)
    {
        try
        {
            var roomState = updateRoomState();
            await Clients.All.SendAsync("RoomStateUpdated", roomState);
            return new HubActionResultDto(true);
        }
        catch (InvalidOperationException exception)
        {
            return new HubActionResultDto(false, exception.Message);
        }
    }
}
