using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chiraq.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RareFlameSouvenir : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Souvenirs_PlaceId_SeasonId",
                table: "Souvenirs");

            migrationBuilder.AddColumn<bool>(
                name: "IsRareFlame",
                table: "Souvenirs",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Souvenirs_PlaceId_SeasonId_IsRareFlame",
                table: "Souvenirs",
                columns: new[] { "PlaceId", "SeasonId", "IsRareFlame" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Souvenirs_PlaceId_SeasonId_IsRareFlame",
                table: "Souvenirs");

            migrationBuilder.DropColumn(
                name: "IsRareFlame",
                table: "Souvenirs");

            migrationBuilder.CreateIndex(
                name: "IX_Souvenirs_PlaceId_SeasonId",
                table: "Souvenirs",
                columns: new[] { "PlaceId", "SeasonId" },
                unique: true);
        }
    }
}
