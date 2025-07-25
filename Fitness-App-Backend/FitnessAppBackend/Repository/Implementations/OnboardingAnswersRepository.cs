using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Repository.Implementations
{
    public class OnboardingAnswersRepository : GenericService<OnboardingAnswers>, IOnboardingAnswersRepository
    {
        public OnboardingAnswersRepository(ApplicationDbContext context) : base(context)
        {
        }

        public void AddRange(IEnumerable<OnboardingAnswers> entities)
        {
            _context.Set<OnboardingAnswers>().AddRange(entities);
        }

        public async Task<string> GetOnboardingAnswerByUserIdAsync(Guid userId, string question)
        {
            return await _dbSet
                .Where(x => x.UserId == userId && x.Question == question)
                .Select(x => x.Answer)
                .FirstOrDefaultAsync();
        }

        public async Task<List<OnboardingAnswersDTO>> GetOnboardingAnswersByUserIdAsync(Guid UserId)
        {
            return await _dbSet
                .Where(x => x.UserId == UserId)
                .Select(x => new OnboardingAnswersDTO
                {
                    Question = x.Question,
                    Answer = x.Answer
                })
                .ToListAsync();
        }
    }
}
