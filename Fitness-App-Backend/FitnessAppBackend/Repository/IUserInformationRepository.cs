using FitnessAppBackend.Model;

namespace FitnessAppBackend.Repository
{
    public interface IUserInformationRepository : IGenericRepository<UserInformation>
    {
        Task<UserInformation?> GetByUserIdAsync(Guid userId);
        Task UpdateUserInformationAsync(UserInformation userInformation);
    }
}
