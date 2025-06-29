using FitnessAppBackend.Data;
using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
