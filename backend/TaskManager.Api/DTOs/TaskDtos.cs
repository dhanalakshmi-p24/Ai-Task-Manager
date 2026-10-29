using System.ComponentModel.DataAnnotations;
using TaskManager.Api.Models;

namespace TaskManager.Api.DTOs;

public record TaskDto(
    int Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    TaskPriority Priority,
    DateOnly? DueDate,
    bool IsOverdue,
    DateTime CreatedAt,
    DateTime UpdatedAt);

/// <summary>Payload for create (POST) and full update (PUT).</summary>
public class TaskUpsertDto : IValidatableObject
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Status is required.")]
    [EnumDataType(typeof(TaskItemStatus), ErrorMessage = "Status is not valid.")]
    public TaskItemStatus? Status { get; set; }

    [Required(ErrorMessage = "Priority is required.")]
    [EnumDataType(typeof(TaskPriority), ErrorMessage = "Priority is not valid.")]
    public TaskPriority? Priority { get; set; }

    public DateOnly? DueDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DueDate is { Year: < 2000 or > 2100 })
        {
            yield return new ValidationResult("Due date must be between 2000 and 2100.", [nameof(DueDate)]);
        }
    }
}
