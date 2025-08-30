using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Service;

namespace FitnessAppBackend.Repository.Implementations
{
    public class ConsumedMealRepository : GenericService<ConsumedMeal>, IConsumedMealRepository
    {
        public ConsumedMealRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId)
        {
            return Task.FromResult(
                _context.ConsumedMeals
                    .Where(meal => meal.UserId == userId)
                    .AsEnumerable()
            );
        }
    }
}
