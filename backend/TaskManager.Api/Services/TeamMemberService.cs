using TaskManager.Api.DTOs;
using TaskManager.Api.Repositories;

namespace TaskManager.Api.Services;

public class TeamMemberService(ITeamMemberRepository repository) : ITeamMemberService
{
    public async Task<List<TeamMemberDto>> GetAllAsync() =>
        (await repository.GetAllAsync()).Select(m => m.ToDto()).ToList();

    public async Task<TeamMemberDto> GetByIdAsync(int id)
    {
        var member = await repository.GetByIdAsync(id)
                     ?? throw new NotFoundException($"Team member with id {id} was not found.");
        return member.ToDto();
    }
}
