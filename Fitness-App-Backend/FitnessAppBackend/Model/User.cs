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
        public UserInformation UserInformation { get; set; }
       // public ICollection<Workout> Workouts { get; set; }
       // public ICollection<Meals> MealS { get; set; }
       // public ICollection<Roadmap> Roadmap { get; set; }

    }
}
