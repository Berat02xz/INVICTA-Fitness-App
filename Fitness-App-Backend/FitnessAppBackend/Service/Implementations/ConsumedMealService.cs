using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class ConsumedMealService : GenericService<ConsumedMeal>, IConsumedMealService
    {
        private readonly IConsumedMealRepository _consumedMealRepository;

        public ConsumedMealService(ApplicationDbContext context, IConsumedMealRepository consumedMealRepository) : base(consumedMealRepository)
        {
            _consumedMealRepository = consumedMealRepository;
        }

        public async Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId)
        {
            return await _consumedMealRepository.GetMealsByUserIdAsync(userId);
        }
    }
}
