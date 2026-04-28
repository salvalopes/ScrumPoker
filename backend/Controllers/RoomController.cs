using backend.Contracts;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/room")]
public sealed class RoomController(IPokerRoomService pokerRoomService) : ControllerBase
{
    [HttpGet("state")]
    [ProducesResponseType<RoomStateDto>(StatusCodes.Status200OK)]
    public ActionResult<RoomStateDto> GetState()
    {
        return Ok(pokerRoomService.GetRoomState());
    }
}
