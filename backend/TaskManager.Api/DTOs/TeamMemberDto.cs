namespace TaskManager.Api.DTOs;

public record TeamMemberDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string Department,
    bool IsActive,
    DateTime CreatedAt);
