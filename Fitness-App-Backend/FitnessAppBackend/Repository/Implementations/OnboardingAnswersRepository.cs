using FitnessAppBackend.Data;
using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository.Implementations
{
    public class OnboardingAnswersRepository : GenericRepository<OnboardingAnswers>, IOnboardingAnswersRepository
    {
        public OnboardingAnswersRepository(ApplicationDbContext context) : base(context) 
        { 
        
        }


    }
}
