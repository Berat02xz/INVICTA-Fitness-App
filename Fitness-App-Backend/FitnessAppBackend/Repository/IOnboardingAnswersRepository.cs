using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;

namespace FitnessAppBackend.Repository
{
    public interface IOnboardingAnswersRepository : IGenericRepository<OnboardingAnswers>
    {
        void AddRange(IEnumerable<OnboardingAnswers> entities);
        Task<List<OnboardingAnswersDTO>> GetOnboardingAnswersByUserIdAsync(Guid UserId);
    }
}
