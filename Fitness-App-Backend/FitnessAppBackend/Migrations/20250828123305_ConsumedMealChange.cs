using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessAppBackend.Migrations
{
    /// <inheritdoc />
    public partial class ConsumedMealChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Label",
                table: "ConsumedMeals",
                newName: "MealQuality");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MealQuality",
                table: "ConsumedMeals",
                newName: "Label");
        }
    }
}
