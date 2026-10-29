namespace TaskManager.Api.Services;

public class NotFoundException(string message) : Exception(message);

public class ConflictException(string message) : Exception(message);
