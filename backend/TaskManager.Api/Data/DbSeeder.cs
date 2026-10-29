using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Models;

namespace TaskManager.Api.Data;

/// <summary>
/// Inserts sample data on startup. Each table is seeded only while it is empty, so restarts never
/// duplicate data and sample rows the user deleted are not resurrected. Unique indexes on task title
/// and member email act as a database-level safety net (e.g. two instances starting at once).
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, ILogger logger)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        var members = new List<TeamMember>
        {
            new() { FullName = "Priya Raman", Email = "priya.raman@example.com", Role = "Engineering Manager", Department = "Engineering" },
            new() { FullName = "Arjun Mehta", Email = "arjun.mehta@example.com", Role = "Senior Backend Developer", Department = "Engineering" },
            new() { FullName = "Sofia Alvarez", Email = "sofia.alvarez@example.com", Role = "Frontend Developer", Department = "Engineering" },
            new() { FullName = "Daniel Kim", Email = "daniel.kim@example.com", Role = "Product Designer", Department = "Design" },
            new() { FullName = "Grace Okafor", Email = "grace.okafor@example.com", Role = "QA Engineer", Department = "Quality Assurance", IsActive = false },
        };

        var tasks = new List<TaskItem>
        {
            NewTask("Set up CI/CD pipeline", "Configure build, test and deploy stages for the API and web app.", TaskItemStatus.Done, TaskPriority.High, today.AddDays(-10)),
            NewTask("Design login page mockups", "Create desktop and mobile mockups for the new login experience.", TaskItemStatus.Done, TaskPriority.Medium, today.AddDays(-6)),
            NewTask("Implement user authentication API", "JWT-based login, refresh tokens and password reset endpoints.", TaskItemStatus.InProgress, TaskPriority.Critical, today.AddDays(3)),
            NewTask("Write unit tests for task service", "Cover create, update and delete paths including validation errors.", TaskItemStatus.InProgress, TaskPriority.Medium, today.AddDays(5)),
            NewTask("Fix pagination bug on reports page", "Page 2 repeats the last rows of page 1 when filters are applied.", TaskItemStatus.InReview, TaskPriority.High, today.AddDays(1)),
            NewTask("Database index optimization", "Analyse slow queries and add missing indexes on frequently filtered columns.", TaskItemStatus.Todo, TaskPriority.High, today.AddDays(7)),
            NewTask("Update API documentation", "Refresh OpenAPI descriptions and add request/response examples.", TaskItemStatus.Todo, TaskPriority.Low, today.AddDays(14)),
            NewTask("Accessibility audit", "Run WCAG 2.1 AA checks on all main screens and log issues.", TaskItemStatus.Todo, TaskPriority.Medium, today.AddDays(10)),
            NewTask("Migrate file storage to cloud", "Move uploaded attachments from local disk to object storage.", TaskItemStatus.Todo, TaskPriority.Critical, today.AddDays(-2)),
            NewTask("Customer feedback survey analysis", "Summarise Q3 survey results and share key themes with product.", TaskItemStatus.InReview, TaskPriority.Low, today.AddDays(4)),
            NewTask("Performance load testing", "Load test core endpoints at 500 concurrent users and report bottlenecks.", TaskItemStatus.InProgress, TaskPriority.High, today.AddDays(-1)),
            NewTask("Onboarding documentation for new hires", "Write a getting-started guide covering local setup and team workflows.", TaskItemStatus.Done, TaskPriority.Low, null),
        };

        var seedMembers = !await db.TeamMembers.AnyAsync();
        var seedTasks = !await db.Tasks.AnyAsync();

        if (!seedMembers && !seedTasks)
        {
            logger.LogInformation("Sample data already present; skipping seeding.");
            return;
        }

        if (seedMembers)
        {
            members.ForEach(m => m.CreatedAt = now);
            db.TeamMembers.AddRange(members);
        }
        if (seedTasks)
        {
            db.Tasks.AddRange(tasks);
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Members} team member(s) and {Tasks} task(s).",
            seedMembers ? members.Count : 0, seedTasks ? tasks.Count : 0);

        TaskItem NewTask(string title, string description, TaskItemStatus status, TaskPriority priority, DateOnly? due) => new()
        {
            Title = title,
            Description = description,
            Status = status,
            Priority = priority,
            DueDate = due,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}
