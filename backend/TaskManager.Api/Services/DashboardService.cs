using TaskManager.Api.DTOs;
using TaskManager.Api.Models;
using TaskManager.Api.Repositories;

namespace TaskManager.Api.Services;

public class DashboardService(
    ITaskRepository taskRepository,
    ITeamMemberRepository teamMemberRepository,
    TimeProvider clock) : IDashboardService
{
    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        var weekEnd = today.AddDays(7);

        // Volume is small for this app, so aggregating in memory keeps the logic simple and readable.
        var tasks = await taskRepository.GetAllAsync();
        var memberCount = await teamMemberRepository.CountAsync();

        var total = tasks.Count;
        var completed = tasks.Count(t => t.Status == TaskItemStatus.Done);
        var open = tasks.Where(t => t.Status != TaskItemStatus.Done).ToList();

        var byStatus = Enum.GetValues<TaskItemStatus>()
            .ToDictionary(s => s.ToString(), s => tasks.Count(t => t.Status == s));
        var byPriority = Enum.GetValues<TaskPriority>()
            .ToDictionary(p => p.ToString(), p => tasks.Count(t => t.Priority == p));

        var upcoming = open
            .Where(t => t.DueDate.HasValue && t.DueDate.Value >= today)
            .OrderBy(t => t.DueDate)
            .Take(5)
            .Select(t => t.ToDto(today))
            .ToList();

        return new DashboardStatsDto(
            TotalTasks: total,
            CompletedTasks: completed,
            InProgressTasks: byStatus[nameof(TaskItemStatus.InProgress)],
            OverdueTasks: open.Count(t => Mappings.IsOverdue(t, today)),
            DueThisWeek: open.Count(t => t.DueDate >= today && t.DueDate <= weekEnd),
            CompletionRate: total == 0 ? 0 : Math.Round(completed * 100.0 / total, 1),
            TeamMemberCount: memberCount,
            ByStatus: byStatus,
            ByPriority: byPriority,
            RecentTasks: tasks.Take(5).Select(t => t.ToDto(today)).ToList(),
            UpcomingTasks: upcoming);
    }
}
