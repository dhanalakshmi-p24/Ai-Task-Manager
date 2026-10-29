namespace TaskManager.Api.Models;

// Named TaskItemStatus to avoid clashing with System.Threading.Tasks.TaskStatus.
public enum TaskItemStatus
{
    Todo,
    InProgress,
    InReview,
    Done
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}
