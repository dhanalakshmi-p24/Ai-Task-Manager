using TaskManager.Api.DTOs;

namespace TaskManager.Api.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
