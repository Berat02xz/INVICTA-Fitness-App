namespace FitnessAppBackend.Model
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<OnboardingAnswers> OnboardingAnswers { get; set; }

    }
}
