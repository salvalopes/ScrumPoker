namespace backend.Contracts;

public sealed record HubActionResultDto(bool Succeeded, string? ErrorMessage = null);
