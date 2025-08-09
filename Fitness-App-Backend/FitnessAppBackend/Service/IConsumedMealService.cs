
using FitnessAppBackend.Model;

namespace FitnessAppBackend.Service
{
    public interface IConsumedMealService : IGenericService<ConsumedMeal>
    {
        Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId);
    }
}
