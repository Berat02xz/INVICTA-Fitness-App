namespace FitnessAppBackend.Model.DTO
{
    public class OnboardingDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public ICollection<OnboardingAnswersDTO> Answers { get; set; }

    }
}
