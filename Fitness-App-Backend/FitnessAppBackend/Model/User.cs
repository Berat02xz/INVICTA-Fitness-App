namespace FitnessAppBackend.Model
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Role { get; set; } = "Free";
        public UserInformation UserInformation { get; set; }
       // public ICollection<Workout> Workouts { get; set; }
       public ICollection<ConsumedMeal> ConsumedMeals { get; set; }
       // public ICollection<Roadmap> Roadmap { get; set; }

    }
}
