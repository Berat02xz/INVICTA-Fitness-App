using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Model
{
    public class ConsumedMeal
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public string Name { get; set; }
        public int Calories { get; set; }
        public int Protein { get; set; }
        public int Carbohydrates { get; set; }
        public int Fats { get; set; }
        public string MealQuality { get; set; }
        public int HealthScoreOutOf10 { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
    }
}