using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;
using System.Security.Cryptography.X509Certificates;

namespace FitnessAppBackend.Service.Implementations
{
    public class UserService : GenericService<User>, IUserService
    {
        private readonly IUserRepository _repository;
        public UserService(IUserRepository repository) : base(repository)
        {
            _repository = repository;
        }

        public Task<ICollection<User?>> GetAllLazy()
        {
            return _repository.GetAllLazy();
        }

        public string HashPassword(string password)
        {
            String hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            return hashedPassword;
        }


        Task<User?> IUserService.GetUserByEmailAsync(string email)
        {
            return _repository.GetUserByEmailAsync(email);
        }


    }
}
