namespace TaskManager.Api.DTOs;

public record DashboardStatsDto(
    int TotalTasks,
    int CompletedTasks,
    int InProgressTasks,
    int OverdueTasks,
    int DueThisWeek,
    double CompletionRate,
    int TeamMemberCount,
    Dictionary<string, int> ByStatus,
    Dictionary<string, int> ByPriority,
    List<TaskDto> RecentTasks,
    List<TaskDto> UpcomingTasks);
