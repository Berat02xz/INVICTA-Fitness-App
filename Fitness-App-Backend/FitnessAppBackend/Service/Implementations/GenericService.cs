
using FitnessAppBackend.Data;
using FitnessAppBackend.Repository;

namespace FitnessAppBackend.Service.Implementations
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        protected readonly IGenericRepository<T> _repository;
        private ApplicationDbContext context;

        public GenericService(IGenericRepository<T> repository)
        {
            _repository = repository;
        }

        public GenericService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task AddAsync(T entity)
        {
            await _repository.AddAsync(entity);
        }

        public async Task DeleteAsync(Guid Id)
        {
            await _repository.DeleteAsync(Id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<T> GetByIdAsync(Guid Id)
        {
            return await _repository.GetByIdAsync(Id);
        }

        public async Task UpdateAsync(T entity)
        {
            await _repository.UpdateAsync(entity);
        }
    }
}
