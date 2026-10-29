using TaskManager.Api.DTOs;
using TaskManager.Api.Models;

namespace TaskManager.Api.Services;

public static class Mappings
{
    public static TaskDto ToDto(this TaskItem t, DateOnly today) => new(
        t.Id,
        t.Title,
        t.Description,
        t.Status,
        t.Priority,
        t.DueDate,
        IsOverdue(t, today),
        t.CreatedAt,
        t.UpdatedAt);

    public static TeamMemberDto ToDto(this TeamMember m) => new(
        m.Id, m.FullName, m.Email, m.Role, m.Department, m.IsActive, m.CreatedAt);

    public static bool IsOverdue(TaskItem t, DateOnly today) =>
        t.Status != TaskItemStatus.Done && t.DueDate.HasValue && t.DueDate.Value < today;
}
