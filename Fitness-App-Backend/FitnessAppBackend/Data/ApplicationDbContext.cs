using Microsoft.EntityFrameworkCore;
namespace FitnessAppBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options){}
       
        public DbSet<Model.User> Users { get; set; }
        public DbSet<Model.UserInformation> UserInformation { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Additional model configurations can go here

            modelBuilder.Entity<Model.User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<Model.UserInformation>()
                .HasKey(ui => ui.Id);

            modelBuilder.Entity<Model.UserInformation>()
                .HasOne(ui => ui.User)
                .WithOne(u => u.UserInformation)
                .HasForeignKey<Model.UserInformation>(ui => ui.UserId)
                .OnDelete(DeleteBehavior.Cascade);




        }
    }
    
 }
