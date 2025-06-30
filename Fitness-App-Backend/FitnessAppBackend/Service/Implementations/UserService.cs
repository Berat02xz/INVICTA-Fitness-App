using FitnessAppBackend.Data;
using FitnessAppBackend.Model;
using FitnessAppBackend.Repository;
using System.Security.Cryptography.X509Certificates;

namespace FitnessAppBackend.Service.Implementations
{
    public class UserService : GenericService<User>, IUserService
    {
        private readonly IUserRepository _repository;
        public UserService(IUserRepository _repository) : base(_repository)
        {    
            _repository = _repository;
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
