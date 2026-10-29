using Microsoft.AspNetCore.Mvc;
using TaskManager.Api.DTOs;
using TaskManager.Api.Services;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/team-members")]
[Produces("application/json")]
public class TeamMembersController(ITeamMemberService teamMemberService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<List<TeamMemberDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TeamMemberDto>>> GetAll() => Ok(await teamMemberService.GetAllAsync());

    [HttpGet("{id:int}")]
    [ProducesResponseType<TeamMemberDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> GetById(int id) => Ok(await teamMemberService.GetByIdAsync(id));
}
