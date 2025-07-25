using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class UserInformationService : GenericService<UserInformation>, IUserInformationService
    {
        private readonly IUserInformationRepository _userInformationRepository;

        public UserInformationService(ApplicationDbContext context, IUserInformationRepository userInformationRepository) 
            : base(context)
        {
            _userInformationRepository = userInformationRepository;
        }

        public UserInformation GetByUserId(Guid userId)
        {
            return _userInformationRepository.GetByUserId(userId);
        }

        public void UpdateUserInformation(UserInformation userInformation)
        {
            if (userInformation == null)
                throw new ArgumentNullException(nameof(userInformation));

            _userInformationRepository.UpdateUserInformation(userInformation);
        }
    }
}
