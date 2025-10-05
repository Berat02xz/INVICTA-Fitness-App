using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessAppBackend.Migrations
{
    /// <inheritdoc />
    public partial class HealthScoreAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HealthScoreOutOf10",
                table: "ConsumedMeals",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HealthScoreOutOf10",
                table: "ConsumedMeals");
        }
    }
}
