using FitnessAppBackend.Model;

namespace FitnessAppBackend.Service
{
    public interface IUserInformationService : IGenericService<UserInformation>
    {
        UserInformation GetByUserId(Guid userId);
        void UpdateUserInformation(UserInformation userInformation);
    }
}
