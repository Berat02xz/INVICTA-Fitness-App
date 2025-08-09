using FitnessAppBackend.Data;
using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository.Implementations
{
    public class ConsumedMealRepository : GenericService<ConsumedMeal>, IConsumedMealRepository
    {
        private readonly ApplicationDbContext _context;
        public ConsumedMealRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId)
        {
            return Task.FromResult(_context.ConsumedMeals
                .Where(meal => meal.UserId == userId)
                .AsEnumerable());
        }
    }
}
