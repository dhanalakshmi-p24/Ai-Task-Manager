using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.Models;

namespace TaskManager.Api.Repositories;

public class TaskRepository(AppDbContext db) : ITaskRepository
{
    public async Task<List<TaskItem>> GetAllAsync(TaskItemStatus? status = null, TaskPriority? priority = null, string? search = null)
    {
        var query = db.Tasks.AsNoTracking();

        if (status.HasValue) query = query.Where(t => t.Status == status.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(t => EF.Functions.ILike(t.Title, pattern)
                                  || (t.Description != null && EF.Functions.ILike(t.Description, pattern)));
        }

        return await query.OrderByDescending(t => t.UpdatedAt).ThenBy(t => t.Id).ToListAsync();
    }

    public Task<TaskItem?> GetByIdAsync(int id) => db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

    public Task<bool> TitleExistsAsync(string title, int? excludeId = null) =>
        db.Tasks.AnyAsync(t => t.Title.ToLower() == title.ToLower() && (excludeId == null || t.Id != excludeId));

    public async Task<TaskItem> AddAsync(TaskItem task)
    {
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return task;
    }

    public Task UpdateAsync(TaskItem task)
    {
        db.Tasks.Update(task);
        return db.SaveChangesAsync();
    }

    public Task DeleteAsync(TaskItem task)
    {
        db.Tasks.Remove(task);
        return db.SaveChangesAsync();
    }
}
