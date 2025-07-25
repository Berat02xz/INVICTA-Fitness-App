using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;

namespace FitnessAppBackend.Repository
{
    public interface IOnboardingAnswersRepository : IGenericRepository<OnboardingAnswers>
    {
        void AddRange(IEnumerable<OnboardingAnswers> entities);
        Task<string> GetOnboardingAnswerByUserIdAsync(Guid userId, string question);
        Task<List<OnboardingAnswersDTO>> GetOnboardingAnswersByUserIdAsync(Guid UserId);
    }
}
