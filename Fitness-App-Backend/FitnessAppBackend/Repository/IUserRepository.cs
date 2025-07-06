using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<ICollection<User?>> GetAllLazy();
        Task<User?> GetUserByEmailAsync(string email);
    }
}
