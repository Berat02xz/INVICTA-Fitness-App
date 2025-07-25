using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;

namespace FitnessAppBackend.Service
{
    public interface IOnboardingAnswersService : IGenericService<OnboardingAnswers>
    {
        Task AddRangeAsync(IEnumerable<OnboardingAnswers> answerEntities);
        Task<List<OnboardingAnswersDTO>> GetOnboardingAnswersByUserIdAsync(Guid userId);
        Task<String> GetOnboardingAnswerByUserIdAsync(Guid userId, string question);
    }
}
