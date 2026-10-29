using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public interface ITaskRepository
{
    Task<List<TaskItem>> GetAllAsync(TaskItemStatus? status = null, TaskPriority? priority = null, string? search = null);
    Task<TaskItem?> GetByIdAsync(int id);
    Task<bool> TitleExistsAsync(string title, int? excludeId = null);
    Task<TaskItem> AddAsync(TaskItem task);
    Task UpdateAsync(TaskItem task);
    Task DeleteAsync(TaskItem task);
}
