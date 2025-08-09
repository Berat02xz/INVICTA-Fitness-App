namespace FitnessAppBackend.Model.DTO
{
    public class MealAnalysisDTO
    {
        public bool IsMeal { get; set; }
        public string ShortMealName { get; set; }
        public int CaloriesAmount { get; set; }
        public int Protein { get; set; }
        public int Carbs { get; set; }
        public int Fat { get; set; }
        public string Label { get; set; }
    }
}