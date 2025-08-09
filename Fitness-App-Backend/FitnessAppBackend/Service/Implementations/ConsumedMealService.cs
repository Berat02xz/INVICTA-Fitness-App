using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class ConsumedMealService : GenericService<ConsumedMeal>, IConsumedMealService
    {
        private readonly IGenericRepository<ConsumedMeal> _repository;
        private readonly IConsumedMealRepository _consumedMealRepository;

        public ConsumedMealService(IGenericRepository<ConsumedMeal> repository, IConsumedMealRepository consumedMealRepository) : base(repository)
        {
            _consumedMealRepository = consumedMealRepository;
        }

        public async Task<IEnumerable<ConsumedMeal>> GetMealsByUserIdAsync(Guid userId)
        {
            return await _consumedMealRepository.GetMealsByUserIdAsync(userId);
        }
    }
}
