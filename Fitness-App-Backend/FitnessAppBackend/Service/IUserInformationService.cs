using FitnessAppBackend.Model;

namespace FitnessAppBackend.Service
{
    public interface IUserInformationService : IGenericService<UserInformation>
    {
        Task<UserInformation?> GetByUserId(Guid userId);
        Task UpdateUserInformation(UserInformation userInformation);
    }
}
