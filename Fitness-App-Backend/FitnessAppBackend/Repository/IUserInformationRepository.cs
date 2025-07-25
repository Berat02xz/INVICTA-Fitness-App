using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IUserInformationRepository : IGenericRepository<UserInformation>
    {
        UserInformation GetByUserId(Guid userId);
        void UpdateUserInformation(UserInformation userInformation);
    }
}
