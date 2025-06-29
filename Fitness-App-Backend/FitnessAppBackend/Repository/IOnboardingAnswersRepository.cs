using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IOnboardingAnswersRepository : IGenericRepository<OnboardingAnswers>
    {
        Task<List<OnboardingAnswers>> GetOnboardingAnswersByUserIdAsync(Guid UserId);
    }
}
