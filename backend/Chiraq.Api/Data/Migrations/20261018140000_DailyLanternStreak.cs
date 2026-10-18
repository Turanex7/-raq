using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chiraq.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class DailyLanternStreak : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LanternIgnitions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    BakuDate = table.Column<string>(type: "TEXT", nullable: false),
                    ConsecutiveDays = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LanternIgnitions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LanternIgnitions_UserId_BakuDate",
                table: "LanternIgnitions",
                columns: new[] { "UserId", "BakuDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LanternIgnitions");
        }
    }
}
