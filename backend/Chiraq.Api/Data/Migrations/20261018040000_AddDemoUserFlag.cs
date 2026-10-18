using Chiraq.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chiraq.Api.Data.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261018040000_AddDemoUserFlag")]
public partial class AddDemoUserFlag : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) =>
        migrationBuilder.AddColumn<bool>(
            name: "IsDemo",
            table: "Users",
            type: "INTEGER",
            nullable: false,
            defaultValue: false);

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn(name: "IsDemo", table: "Users");
}
