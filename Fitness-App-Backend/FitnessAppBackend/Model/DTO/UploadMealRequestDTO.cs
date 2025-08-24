namespace FitnessAppBackend.Model.DTO
{
    public class UploadMealRequestDTO
    {
        public string? TypeOfUpload { get; set; }
        public Guid UserId { get; set; }
        public IFormFile MealImage { get; set; }
    }
}
