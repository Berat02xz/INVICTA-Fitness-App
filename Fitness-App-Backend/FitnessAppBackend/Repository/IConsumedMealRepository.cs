using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IConsumedMealRepository : IGenericRepository<ConsumedMeal>
    {
          Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId);
    }
}
