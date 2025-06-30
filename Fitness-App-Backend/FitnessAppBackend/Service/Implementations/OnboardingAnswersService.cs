using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class OnboardingAnswersService : GenericService<OnboardingAnswers>, IOnboardingAnswersService
    {
        private readonly IOnboardingAnswersRepository _onboardingRepository;

        public OnboardingAnswersService(IOnboardingAnswersRepository onboardingRepository)
            : base(onboardingRepository)
        {
            _onboardingRepository = onboardingRepository;
        }

        public async Task<List<OnboardingAnswers>> GetOnboardingAnswersByUserIdAsync(Guid userId)
        {
            return await _onboardingRepository.GetOnboardingAnswersByUserIdAsync(userId);
        }
    }
}
