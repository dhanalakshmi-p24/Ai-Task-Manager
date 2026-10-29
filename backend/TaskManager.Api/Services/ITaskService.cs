using TaskManager.Api.DTOs;
using TaskManager.Api.Models;

namespace TaskManager.Api.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetAllAsync(TaskItemStatus? status, TaskPriority? priority, string? search);
    Task<TaskDto> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(TaskUpsertDto dto);
    Task<TaskDto> UpdateAsync(int id, TaskUpsertDto dto);
    Task DeleteAsync(int id);
}
