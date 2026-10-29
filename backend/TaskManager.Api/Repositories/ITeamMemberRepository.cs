using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public interface ITeamMemberRepository
{
    Task<List<TeamMember>> GetAllAsync();
    Task<TeamMember?> GetByIdAsync(int id);
    Task<int> CountAsync();
}
