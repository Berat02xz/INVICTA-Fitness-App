using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Model
{
    [Index(nameof(UserId))] // Indexing UserId for faster queries

    public class OnboardingAnswers
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; }
        

        public string Question { get; set; }
        public string Answer { get; set; }
    }
}
