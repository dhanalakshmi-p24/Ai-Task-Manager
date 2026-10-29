using TaskManager.Api.DTOs;

namespace TaskManager.Api.Services;

public interface ITeamMemberService
{
    Task<List<TeamMemberDto>> GetAllAsync();
    Task<TeamMemberDto> GetByIdAsync(int id);
}
