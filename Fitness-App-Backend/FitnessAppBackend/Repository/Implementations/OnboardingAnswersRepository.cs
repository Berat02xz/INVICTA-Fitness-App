using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Repository.Implementations
{
    public class OnboardingAnswersRepository : GenericRepository<OnboardingAnswers>, IOnboardingAnswersRepository
    {
        public OnboardingAnswersRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<List<OnboardingAnswers>> GetOnboardingAnswersByUserIdAsync(Guid UserId)
        {
            return await _dbSet.Where(x => x.UserId == UserId).ToListAsync();
        }
    }
}
