using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Repository.Implementations
{
    public class UserRepository : GenericService<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ICollection<User>> GetAllLazy()
        {
            var users = await _context.Users
                .Include(u => u.UserInformation)
                .AsNoTracking()
                .ToListAsync();

            return users;
        }


        public Task<User?> GetUserByEmailAsync(string email)
        {
            return _context.Users
                .Include(u => u.UserInformation)
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
