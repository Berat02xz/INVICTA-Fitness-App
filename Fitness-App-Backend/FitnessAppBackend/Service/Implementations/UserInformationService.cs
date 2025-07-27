using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class UserInformationService : GenericService<UserInformation>, IUserInformationService
    {
        private readonly IUserInformationRepository _userInformationRepository;

        public UserInformationService(ApplicationDbContext context, IUserInformationRepository userInformationRepository) 
            : base(userInformationRepository)
        {
            _userInformationRepository = userInformationRepository;
        }

        public async Task<UserInformation?> GetByUserId(Guid userId)
        {
            return await _userInformationRepository.GetByUserIdAsync(userId);
        }

        public async Task UpdateUserInformation(UserInformation userInformation)
        {
            if (userInformation == null)
                throw new ArgumentNullException(nameof(userInformation));

            await _userInformationRepository.UpdateUserInformationAsync(userInformation);
        }
    }
}
