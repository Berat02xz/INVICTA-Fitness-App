using Microsoft.EntityFrameworkCore;
namespace FitnessAppBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options){}
       
        public DbSet<Model.User> Users { get; set; }
        public DbSet<Model.UserInformation> UserInformation { get; set; }
        public DbSet<Model.ConsumedMeal> ConsumedMeals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Model.User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<Model.UserInformation>()
                .HasKey(ui => ui.Id);

            modelBuilder.Entity<Model.UserInformation>()
                .HasOne(ui => ui.User)
                .WithOne(u => u.UserInformation)
                .HasForeignKey<Model.UserInformation>(ui => ui.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Model.ConsumedMeal>()
                .HasKey(m => m.Id);

            modelBuilder.Entity<Model.ConsumedMeal>()
                .HasIndex(m => m.UserId);

            modelBuilder.Entity<Model.ConsumedMeal>()
                .HasOne(m => m.User)
                .WithMany(u => u.ConsumedMeals)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
    
 }
