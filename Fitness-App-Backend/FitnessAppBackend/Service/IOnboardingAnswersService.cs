using FitnessAppBackend.Model;

namespace FitnessAppBackend.Service
{
    public interface IOnboardingAnswersService : IGenericService<OnboardingAnswers>
    {
        Task<List<OnboardingAnswers>> GetOnboardingAnswersByUserIdAsync(Guid userId);
    }
}
