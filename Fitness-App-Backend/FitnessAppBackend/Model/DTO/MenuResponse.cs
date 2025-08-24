namespace FitnessAppBackend.Model.DTO
{
    public class MenuMeal
    {
        public string MenuName { get; set; }
        public int Calories { get; set; }
        public List<string> Ingredients { get; set; }
    }

    public class MenuResponse
    {
        public List<MenuMeal> Meals { get; set; }
    }

}
