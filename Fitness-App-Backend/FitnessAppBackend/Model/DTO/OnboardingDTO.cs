namespace FitnessAppBackend.Model.DTO
{
    public class OnboardingDTO
    {
        public Guid UserId { get; set; }
        public ICollection<OnboardingAnswersDTO> Answers { get; set; }

    }
}
