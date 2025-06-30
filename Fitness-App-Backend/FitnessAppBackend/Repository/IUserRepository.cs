using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IUserRepository : IGenericRepository<User>
    {
        public Task<User?> GetUserByEmailAsync(string email);
    }
}
