namespace FitnessAppBackend.Model.DTO
{
    public class FridgeMeal
    {
        public string Meal { get; set; }
        public int Calories { get; set; }
        public List<string> Ingredients { get; set; }
        public string TimeToMake { get; set; }
    }

    public class FridgeResponse
    {
        public List<FridgeMeal> Meals { get; set; }
    }

}
