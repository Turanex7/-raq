using Chiraq.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chiraq.Api.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261018103500_UniqueGroupBonusLedger")]
public sealed class UniqueGroupBonusLedger : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_XpEvents_UserId_SeasonId_PlaceId",
            table: "XpEvents",
            columns: new[] { "UserId", "SeasonId", "PlaceId" },
            unique: true,
            filter: "\"Kind\" = 'group_bonus'");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_XpEvents_UserId_SeasonId_PlaceId",
            table: "XpEvents");
    }
}
