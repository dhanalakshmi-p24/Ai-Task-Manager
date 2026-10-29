using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public class TeamMemberRepository(AppDbContext db) : ITeamMemberRepository
{
    public Task<List<TeamMember>> GetAllAsync() =>
        db.TeamMembers.AsNoTracking().OrderBy(m => m.FullName).ToListAsync();

    public Task<TeamMember?> GetByIdAsync(int id) =>
        db.TeamMembers.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);

    public Task<int> CountAsync() => db.TeamMembers.CountAsync();
}
