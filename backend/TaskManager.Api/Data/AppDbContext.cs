using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Models;

namespace TaskManager.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(e =>
        {
            e.ToTable("tasks");
            e.Property(t => t.Title).HasMaxLength(200).IsRequired();
            e.Property(t => t.Description).HasMaxLength(2000);
            e.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);
            // Unique title lets the seeder match sample tasks by natural key and prevents duplicates.
            e.HasIndex(t => t.Title).IsUnique();
            e.HasIndex(t => t.Status);
        });

        modelBuilder.Entity<TeamMember>(e =>
        {
            e.ToTable("team_members");
            e.Property(m => m.FullName).HasMaxLength(100).IsRequired();
            e.Property(m => m.Email).HasMaxLength(200).IsRequired();
            e.Property(m => m.Role).HasMaxLength(100).IsRequired();
            e.Property(m => m.Department).HasMaxLength(100).IsRequired();
            e.HasIndex(m => m.Email).IsUnique();
        });
    }
}
