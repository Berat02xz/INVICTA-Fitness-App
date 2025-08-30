namespace FitnessAppBackend.Model.DTO
{
    public class AddMealDTO
    {
        public Guid UserId { get; set; }
        public string MealName { get; set; }
        public int Calories { get; set; }
        public int Protein { get; set; }
        public int Carbohydrates { get; set; }
        public int Fats { get; set; }
        public string MealQuality { get; set; }

    }
}