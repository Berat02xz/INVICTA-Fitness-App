namespace FitnessAppBackend.Model.DTO
{
    public class MealResponse
    {
        public bool IsMeal { get; set; }
        public string ShortMealName { get; set; }
        public int CaloriesAmount { get; set; }
        public int Protein { get; set; }
        public int Carbs { get; set; }
        public int Fat { get; set; }
        public MealLabel Label { get; set; }
    }

    public enum MealLabel
    {
        HighFat,
        BalancedMeal,
        MacroRich,
        ConsiderLighterOption,
        DairyRich
    }
}
