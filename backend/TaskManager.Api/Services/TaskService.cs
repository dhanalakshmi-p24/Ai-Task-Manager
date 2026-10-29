using TaskManager.Api.DTOs;
using TaskManager.Api.Models;
using TaskManager.Api.Repositories;

namespace TaskManager.Api.Services;

public class TaskService(ITaskRepository repository, TimeProvider clock) : ITaskService
{
    private DateOnly Today => DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);

    public async Task<List<TaskDto>> GetAllAsync(TaskItemStatus? status, TaskPriority? priority, string? search)
    {
        var tasks = await repository.GetAllAsync(status, priority, search);
        var today = Today;
        return tasks.Select(t => t.ToDto(today)).ToList();
    }

    public async Task<TaskDto> GetByIdAsync(int id) => (await FindOrThrowAsync(id)).ToDto(Today);

    public async Task<TaskDto> CreateAsync(TaskUpsertDto dto)
    {
        var title = dto.Title.Trim();
        await EnsureTitleIsUniqueAsync(title);

        var now = clock.GetUtcNow().UtcDateTime;
        var task = new TaskItem
        {
            Title = title,
            Description = Normalize(dto.Description),
            Status = dto.Status!.Value,
            Priority = dto.Priority!.Value,
            DueDate = dto.DueDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        await repository.AddAsync(task);
        return task.ToDto(Today);
    }

    public async Task<TaskDto> UpdateAsync(int id, TaskUpsertDto dto)
    {
        var task = await FindOrThrowAsync(id);
        var title = dto.Title.Trim();
        await EnsureTitleIsUniqueAsync(title, id);

        task.Title = title;
        task.Description = Normalize(dto.Description);
        task.Status = dto.Status!.Value;
        task.Priority = dto.Priority!.Value;
        task.DueDate = dto.DueDate;
        task.UpdatedAt = clock.GetUtcNow().UtcDateTime;

        await repository.UpdateAsync(task);
        return task.ToDto(Today);
    }

    public async Task DeleteAsync(int id)
    {
        var task = await FindOrThrowAsync(id);
        await repository.DeleteAsync(task);
    }

    private async Task<TaskItem> FindOrThrowAsync(int id) =>
        await repository.GetByIdAsync(id) ?? throw new NotFoundException($"Task with id {id} was not found.");

    private async Task EnsureTitleIsUniqueAsync(string title, int? excludeId = null)
    {
        if (await repository.TitleExistsAsync(title, excludeId))
        {
            throw new ConflictException($"A task titled '{title}' already exists.");
        }
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
