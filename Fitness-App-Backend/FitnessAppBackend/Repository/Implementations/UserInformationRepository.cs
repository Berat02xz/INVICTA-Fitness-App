using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppBackend.Repository.Implementations
{
    public class UserInformationRepository : GenericService<UserInformation>, IUserInformationRepository
    {
        public UserInformationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<UserInformation?> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserInformation
                .FirstOrDefaultAsync(ui => ui.UserId == userId);
        }

        public async Task UpdateUserInformationAsync(UserInformation userInformation)
        {
            var existingUserInformation = await _context.UserInformation
                .FirstOrDefaultAsync(ui => ui.UserId == userInformation.UserId);
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
                existingUserInformation.Bmi = userInformation.Bmi;
                existingUserInformation.Bmr = userInformation.Bmr;
                existingUserInformation.Tdee = userInformation.Tdee;
                existingUserInformation.Gender = userInformation.Gender;
                existingUserInformation.CaloricIntake = userInformation.CaloricIntake;
                existingUserInformation.CaloricDeficit = userInformation.CaloricDeficit;
                existingUserInformation.AppName = userInformation.AppName;

                _context.UserInformation.Update(existingUserInformation);
                _context.SaveChanges();
            }
        }
    }
}
