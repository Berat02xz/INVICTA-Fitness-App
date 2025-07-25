using FitnessAppBackend.Data;
using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository.Implementations
{
    public class UserInformationRepository : GenericService<UserInformation>, IUserInformationRepository
    {
        public UserInformationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public UserInformation GetByUserId(Guid userId)
        {
            return _context.UserInformation
                .FirstOrDefault(ui => ui.UserId == userId);
        }

        public void UpdateUserInformation(UserInformation userInformation)
        {
            var existingUserInformation = _context.UserInformation
                .FirstOrDefault(ui => ui.UserId == userInformation.UserId);
            if (existingUserInformation != null)
            {
                existingUserInformation.Age = userInformation.Age;
                existingUserInformation.Unit = userInformation.Unit;
                existingUserInformation.ActivityLevel = userInformation.ActivityLevel;
                existingUserInformation.EquipmentAccess = userInformation.EquipmentAccess;
                existingUserInformation.FitnessLevel = userInformation.FitnessLevel;
                existingUserInformation.Goal = userInformation.Goal;
                existingUserInformation.Height = userInformation.Height;
                existingUserInformation.Weight = userInformation.Weight;
                existingUserInformation.BMI = userInformation.BMI;
                existingUserInformation.BMR = userInformation.BMR;
                existingUserInformation.TDEE = userInformation.TDEE;
                existingUserInformation.Gender = userInformation.Gender;
                existingUserInformation.CaloricIntake = userInformation.CaloricIntake;
                _context.UserInformation.Update(existingUserInformation);
                _context.SaveChanges();
            }
        }
    }
}
