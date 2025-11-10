using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitnessAppBackend.Migrations
{
    /// <inheritdoc />
    public partial class Simplify : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OneEmoji",
                table: "ConsumedMeals",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OneEmoji",
                table: "ConsumedMeals");
        }
    }
}
