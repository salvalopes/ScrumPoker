using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/room")]
public sealed class RoomController(IPokerRoomService pokerRoomService) : ControllerBase
{
    [HttpGet("{roomId}/state")]
    [ProducesResponseType<RoomStateDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<RoomStateDto> GetState(string roomId)
    {
        if (string.IsNullOrEmpty(roomId) ||
            roomId.Length > 20 ||
            !roomId.All(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')))
        {
            return BadRequest("Invalid room ID.");
        }

        return Ok(pokerRoomService.GetRoomState(roomId));
    }
}
