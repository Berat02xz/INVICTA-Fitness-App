using FitnessAppBackend.Model;
using FitnessAppBackend.Model.DTO;
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

        public async Task AddRangeAsync(IEnumerable<OnboardingAnswers> answerEntities)
        {
            _onboardingRepository.AddRange(answerEntities);
            await _onboardingRepository.SaveChangesAsync();
        }

        public async Task<string> GetOnboardingAnswerByUserIdAsync(Guid userId, string question)
        {
            return await _onboardingRepository.GetOnboardingAnswerByUserIdAsync(userId, question);
        }

        public async Task<List<OnboardingAnswersDTO>> GetOnboardingAnswersByUserIdAsync(Guid userId)
        {
            return await _onboardingRepository.GetOnboardingAnswersByUserIdAsync(userId);
        }
    }
}
