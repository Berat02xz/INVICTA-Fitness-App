using Microsoft.EntityFrameworkCore;
namespace FitnessAppBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options){}
       
        public DbSet<Model.OnboardingAnswers> OnboardingAnswers { get; set; }
        public DbSet<Model.User> Users { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Additional model configurations can go here

            modelBuilder.Entity<Model.User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<Model.OnboardingAnswers>()
                .HasKey(o => o.Id);

            modelBuilder.Entity<Model.OnboardingAnswers>()
                .HasOne(o => o.User)
                .WithMany(u => u.OnboardingAnswers)
                .HasForeignKey(o => o.UserId);




        }
    }
    
 }
