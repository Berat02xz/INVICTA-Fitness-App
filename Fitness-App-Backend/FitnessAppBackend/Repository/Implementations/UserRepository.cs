using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Repository.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<User?> GetUserByEmailAsync(string email)
        {
            return _context.Users
                .Include(u => u.OnboardingAnswers)
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
