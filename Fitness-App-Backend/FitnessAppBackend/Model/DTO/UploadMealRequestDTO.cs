namespace FitnessAppBackend.Model.DTO
{
    public class UploadMealRequestDTO
    {
        public Guid UserId { get; set; }
        public IFormFile MealImage { get; set; }
    }
}
