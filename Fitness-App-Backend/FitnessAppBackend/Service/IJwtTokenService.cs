namespace FitnessAppBackend.Service
{
    public interface IJwtTokenService
    {
        string GenerateToken(Guid userId, string email, string name);
    }
}
