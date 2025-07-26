namespace FitnessAppBackend.Model.DTO
{
    public class UserInformationDTO
    {
        public Guid UserId { get; set; }
        public Dictionary<string, object> Answers { get; set; }
    }
}