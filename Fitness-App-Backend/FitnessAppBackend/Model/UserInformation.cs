namespace FitnessAppBackend.Model
{
    public class UserInformation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public int Age { get; set; }
        public string Unit { get; set; }
        public string Gender { get; set; }
        public string Height { get; set; }
        public double Weight { get; set; }
        public string EquipmentAccess { get; set; }
        public string ActivityLevel { get; set; }
        public string FitnessLevel { get; set; }
        public string Goal { get; set; }
        public double Bmi { get; set; }
        public double Bmr { get; set; }
        public double Tdee { get; set; }
        public double CaloricIntake { get; set; }
        public string CaloricDeficit { get; set; }
        public string AppName { get; set; }
    }
}